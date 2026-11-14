import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Controles de proceso de ADR-0008 sobre los .gql de los conectores (se ejecuta en CI).
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
/** Borrados permitidos: relaciones sin historia propia, con AuditEvent en la misma transacción. */
const DELETE_ALLOWLIST = new Set(['UnassignMemberBranch']);

const operations = readOperations();

describe('reglas de los conectores (ADR-0008)', () => {
  it('se leyeron las operaciones', () => {
    expect(operations.map((op) => op.name)).toContain('AddMember');
    expect(operations.length).toBeGreaterThanOrEqual(10);
  });

  it.each(operations.map((op) => [op.name, op] as const))('%s', (_name, op) => {
    // 1. Toda operación declara @auth y nunca es pública en esta fase.
    expect(op.header).toMatch(/@auth\(level: USER\)/);

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

    // 6. Empresas, sucursales, roles, permisos y auditoría no se crean ni modifican desde la app.
    expect(op.body).not.toMatch(
      /\b(tenant|branch|role|permission|rolePermission)_(insert|upsert|update|delete)(Many)?\(/,
    );
    expect(op.body).not.toMatch(/auditEvent_(update|delete|upsert)(Many)?\(/);
  });
});
