import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const deepmerge = require('./index.cjs') as typeof import('./index.d.ts');

describe('deepmerge-safe', () => {
  it('fusiona objetos anidados sin modificar los originales', () => {
    const a = { extensions: ['.js'], browser: false, nested: { x: 1 } };
    const b = { extensions: ['.ts'], nested: { y: 2 } };
    const merged = deepmerge(a, b);
    expect(merged).toEqual({ extensions: ['.js', '.ts'], browser: false, nested: { x: 1, y: 2 } });
    expect(a.nested).toEqual({ x: 1 });
    expect(merged.nested).not.toBe(a.nested);
  });

  it('clona como lo usa @rollup/plugin-node-resolve: deepMerge({}, defaults)', () => {
    const defaults = { dedupe: [], exportConditions: [], mainFields: ['module', 'main'] };
    const copy = deepmerge({}, defaults);
    expect(copy).toEqual(defaults);
    expect(copy.mainFields).not.toBe(defaults.mainFields);
  });

  it('respeta arrayMerge, clone y deepmerge.all', () => {
    const overwrite = (_t: unknown[], s: unknown[]) => s;
    expect(deepmerge({ a: [1] }, { a: [2] }, { arrayMerge: overwrite })).toEqual({ a: [2] });
    expect(deepmerge.all([{ a: 1 }, { b: 2 }, { a: 3 }])).toEqual({ a: 3, b: 2 });
    expect(() => deepmerge.all('x' as unknown as object[])).toThrow();
  });

  it('el objeto devuelto no cambia de prototipo con __proto__ (GHSA-gcqx-w48m-w2h4)', () => {
    const malicious = JSON.parse('{"__proto__": {"polluted": true}, "ok": 1}');
    const merged = deepmerge({}, malicious) as Record<string, unknown>;
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    expect(merged['polluted']).toBeUndefined();
    expect(merged['ok']).toBe(1);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('ignora constructor y prototype en la fuente', () => {
    const malicious = JSON.parse('{"constructor": {"prototype": {"polluted": true}}}');
    const merged = deepmerge({ a: 1 }, malicious) as Record<string, unknown>;
    expect(Object.prototype.hasOwnProperty.call(merged, 'constructor')).toBe(false);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });
});
