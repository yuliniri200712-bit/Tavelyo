import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Controles de proceso de ADR-0008 y ADR-0011 sobre los .gql de los conectores (se ejecuta en CI).
const connectorDir = fileURLToPath(new URL('../connector/', import.meta.url));

interface Operation {
  readonly kind: 'query' | 'mutation';
  readonly name: string;
  readonly header: string;
  readonly body: string;
}

function readOperations(): Operation[] {
  const operations: Operation[] = [];
  for (const file of readdirSync(connectorDir).filter((name) => name.endsWith('.gql'))) {
    const text = readFileSync(join(connectorDir, file), 'utf8')
      .split(/\r?\n/)
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');
    const starts = [...text.matchAll(/^(query|mutation)\s+(\w+)/gm)];
    starts.forEach((match, index) => {
      const end = starts[index + 1]?.index ?? text.length;
      const chunk = text.slice(match.index, end);
      const bodyStart = chunk.search(/\{\s*\n/);
      operations.push({
        kind: match[1] as Operation['kind'],
        name: match[2] ?? '',
        header: chunk.slice(0, bodyStart),
        body: chunk.slice(bodyStart),
      });
    });
  }
  return operations;
}

/** Operaciones que solo tocan datos del propio usuario (excepción de ADR-0008 §2). */
const SELF_ONLY = new Set(['MyProfile', 'UpsertMyProfile', 'MyMemberships']);
/** Únicas operaciones públicas: la carta por QR (ADR-0011 §2). */
const PUBLIC_OPERATIONS = new Set(['PublicMenu']);
/** Operaciones del cliente con sesión anónima: comprueban su participación por auth.uid. */
const CUSTOMER_OPERATIONS = new Set(['MyParticipation', 'MyOrders', 'WithdrawMyOrder']);
/** Operaciones de sucursal: del propietario (ADR-0011 §6) y su modo de envío a cocina (D-32). */
const BRANCH_OPERATIONS = new Set(['CreateBranch', 'UpdateBranch', 'SetBranchOrderApproval']);
/**
 * Variables opcionales admitidas en un filtro. Una variable omitida o nula anula su filtro (el
 * filtro devuelve todo), así que solo se admite donde la expresión de @check la descarta antes.
 */
const NULLABLE_FILTER_ALLOWLIST = new Set(['CreateProduct.taxRuleId', 'UpdateProduct.taxRuleId']);

/** Tipo declarado de una variable en la cabecera de la operación. */
function declaredType(header: string, variable: string): string | undefined {
  return new RegExp(`\\$${variable}:\\s*([\\w\\[\\]!]+)`).exec(header)?.[1];
}
/** Borrados permitidos: relaciones sin historia propia, con AuditEvent en la misma transacción. */
const DELETE_ALLOWLIST = new Set(['UnassignMemberBranch']);

const operations = readOperations();

describe('reglas de los conectores (ADR-0008 y ADR-0011)', () => {
  it('se leyeron las operaciones', () => {
    expect(operations.map((op) => op.name)).toContain('AddMember');
    expect(operations.length).toBeGreaterThanOrEqual(10);
  });

  it.each(operations.map((op) => [op.name, op] as const))('%s', (_name, op) => {
    const level = /@auth\(level: (\w+)\)/.exec(op.header)?.[1];

    // 1. Toda operación declara @auth, y cada nivel distinto de USER solo en su lista blanca.
    expect(level, 'falta @auth').toBeDefined();

    // 1b. Las variables de los filtros son obligatorias, salvo la lista blanca.
    for (const match of op.body.matchAll(/\b(eq|ne|in|nin|gt|ge|lt|le): \$(\w+)/g)) {
      const variable = match[2] ?? '';
      if (NULLABLE_FILTER_ALLOWLIST.has(`${op.name}.${variable}`)) continue;
      expect(
        declaredType(op.header, variable),
        `$${variable} en un filtro debe ser obligatoria`,
      ).toMatch(/!$/);
    }
    if (level === 'PUBLIC') {
      expect(PUBLIC_OPERATIONS.has(op.name), 'PUBLIC fuera de la lista blanca').toBe(true);
      expect(op.body).toMatch(/qrPublicId: \{ eq: \$qrPublicId \}/);
      return;
    }
    if (level === 'USER_ANON') {
      expect(CUSTOMER_OPERATIONS.has(op.name), 'USER_ANON fuera de la lista blanca').toBe(true);
      expect(op.body).toMatch(/authUid: \{ eq_expr: "auth\.uid" \}/);
      expect(op.body).toMatch(/expiresAt: \{ gt_expr: "request\.time" \}/);
      return;
    }
    // Solo de servidor: nombre con prefijo Server y NO_ACCESS, en los dos sentidos.
    expect(level === 'NO_ACCESS', 'Server* debe ser NO_ACCESS y al revés').toBe(
      op.name.startsWith('Server'),
    );
    if (level === 'NO_ACCESS') return;
    expect(level).toBe('USER');

    // 2. La identidad sale de auth.uid y no de una variable.
    expect(op.header).not.toMatch(/\$(actorId|callerId|currentUserId)\b/);

    // 3. Con @auth(level: USER) se exige comprobar la membresía, salvo operaciones sobre sí mismo.
    if (SELF_ONLY.has(op.name)) {
      expect(op.body).toMatch(/auth\.uid/);
    } else {
      expect(op.body).toMatch(
        /membership(s_on_tenant)?\(key: \{ tenantId: \$tenantId, userId_expr: "auth\.uid" \}\)|memberships_on_tenant/,
      );
    }

    // 4. Las mutaciones sobre una empresa son transaccionales y dejan un AuditEvent.
    if (op.kind === 'mutation' && !SELF_ONLY.has(op.name)) {
      expect(op.header).toMatch(/@transaction/);
      expect(op.body).toMatch(/auditEvent_insert/);
      expect(op.body).toMatch(/@redact/);
    }

    // 5. Sin borrados (las FK obligatorias borran en cascada), salvo la lista blanca.
    if (!DELETE_ALLOWLIST.has(op.name)) {
      expect(op.body).not.toMatch(/_delete(Many)?\(/);
    }

    // 6. Empresas, roles, permisos y auditoría no se crean ni modifican desde la app; sucursales,
    //    solo en las operaciones del propietario.
    expect(op.body).not.toMatch(
      /\b(tenant|role|permission|rolePermission)_(insert|upsert|update|delete)(Many)?\(/,
    );
    if (!BRANCH_OPERATIONS.has(op.name)) {
      expect(op.body).not.toMatch(/\bbranch_(insert|upsert|update|delete)(Many)?\(/);
    }
    expect(op.body).not.toMatch(/auditEvent_(update|delete|upsert)(Many)?\(/);
  });
});
