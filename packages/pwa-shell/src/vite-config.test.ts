import { describe, expect, it } from 'vitest';
import { buildId } from './vite-config.ts';

describe('buildId', () => {
  it('sin variable o vacía, la versión es «local»', () => {
    expect(buildId({})).toBe('local');
    expect(buildId({ TAVELYO_BUILD_ID: '' })).toBe('local');
  });

  it.each(['81ddaf6', '2026.11.14-1', 'rc_2'])('acepta %s', (value) => {
    expect(buildId({ TAVELYO_BUILD_ID: value })).toBe(value);
  });

  it.each(['"><script>alert(1)</script>', 'con espacio', 'x'.repeat(65)])(
    'rechaza %j (va dentro de index.html)',
    (value) => {
      expect(() => buildId({ TAVELYO_BUILD_ID: value })).toThrow(/TAVELYO_BUILD_ID/);
    },
  );
});
