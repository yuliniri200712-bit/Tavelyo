// Limpia el DOM entre pruebas de componentes (solo en archivos con entorno jsdom).
import { afterEach } from 'vitest';

afterEach(async () => {
  if (typeof document === 'undefined') return;
  const { cleanup } = await import('@testing-library/react');
  cleanup();
});
