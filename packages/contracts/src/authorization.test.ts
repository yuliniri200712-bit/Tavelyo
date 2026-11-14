import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  ROLES,
  roleHasPermission,
  type PermissionCode,
  type RoleCode,
} from './authorization.ts';

/** Columnas de la matriz de permissions.md §3 que corresponden a roles de personal. */
const COLUMNS: ReadonlyArray<RoleCode | null> = [
  'tenant_owner',
  'branch_admin',
  'waiter',
  'kitchen',
  'cashier',
  null, // Cliente: no es una membresía de personal.
];

/** Lee la matriz acción × rol del documento: ✅ y 🔸 conceden; — deniega. */
function readMatrix(): Map<PermissionCode, Set<RoleCode>> {
  const doc = readFileSync(
    new URL('../../../docs/architecture/permissions.md', import.meta.url),
    'utf8',
  );
  const section = doc.split('## 3. Matriz acción × rol')[1]?.split('\n## ')[0] ?? '';
  const matrix = new Map<PermissionCode, Set<RoleCode>>();
  for (const line of section.split(/\r?\n/)) {
    if (!line.startsWith('| `')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    // Se ignora lo que va entre paréntesis (estados) y `x.open` / `close` se lee como x.close.
    const action = (cells[0] ?? '').replace(/\([^)]*\)/g, '');
    const codes: PermissionCode[] = [];
    for (const [, token = ''] of action.matchAll(/`([a-z_.]+)`/g)) {
      const prefix = codes[0]?.split('.')[0];
      codes.push((token.includes('.') ? token : `${prefix}.${token}`) as PermissionCode);
    }
    const granted = new Set<RoleCode>();
    COLUMNS.forEach((role, index) => {
      const cell = cells[index + 1] ?? '';
      if (role && (cell.startsWith('✅') || cell.startsWith('🔸'))) granted.add(role);
    });
    for (const code of codes) matrix.set(code, granted);
  }
  return matrix;
}

describe('catálogo de roles y permisos', () => {
  const matrix = readMatrix();

  it('la matriz del documento se leyó completa', () => {
    expect(matrix.size).toBeGreaterThanOrEqual(30);
  });

  it('cada acción de la matriz existe en el catálogo y viceversa (salvo audit.read)', () => {
    // Las acciones que ningún rol de personal tiene son del cliente (sesión de mesa), no del catálogo.
    const customerOnly = [...matrix.entries()].filter(([, roles]) => roles.size === 0);
    expect(customerOnly.map(([code]) => code)).toEqual(['service_request.create']);
    const documented = [...matrix.keys()].filter((code) => matrix.get(code)?.size).sort();
    const catalog = Object.keys(PERMISSIONS)
      .filter((code) => code !== 'audit.read')
      .sort();
    expect(catalog).toEqual(documented);
  });

  it.each([...readMatrix().entries()])('%s coincide con la matriz', (permission, granted) => {
    for (const role of Object.keys(ROLES) as RoleCode[]) {
      expect(roleHasPermission(role, permission), `${role} · ${permission}`).toBe(
        granted.has(role),
      );
    }
  });

  it('audit.read es solo del propietario', () => {
    const holders = (Object.keys(ROLES) as RoleCode[]).filter((role) =>
      roleHasPermission(role, 'audit.read'),
    );
    expect(holders).toEqual(['tenant_owner']);
  });

  it('cocina no ve importes ni pagos (minimización, permissions.md §4)', () => {
    const forbidden = ROLES.kitchen.permissions.filter((code) =>
      /^(bill|payment|cash_session|report)\./.test(code),
    );
    expect(forbidden).toEqual([]);
  });

  it('el propietario tiene el rango máximo y los rangos ordenan la jerarquía', () => {
    expect(ROLES.tenant_owner.rank).toBeGreaterThan(ROLES.branch_admin.rank);
    expect(ROLES.branch_admin.rank).toBeGreaterThan(ROLES.cashier.rank);
    expect(ROLES.cashier.rank).toBeGreaterThan(ROLES.waiter.rank);
  });

  it('ningún rol repite permisos', () => {
    for (const role of Object.values(ROLES)) {
      expect(new Set(role.permissions).size).toBe(role.permissions.length);
    }
  });
});
