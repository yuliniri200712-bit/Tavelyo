// Limpia el DOM entre pruebas de componentes (solo en archivos con entorno jsdom).
import { afterEach } from 'vitest';

// Con todo el conjunto en paralelo, la primera búsqueda de cada archivo paga la carga de sus módulos
// y 1 s (el valor por defecto) a veces no basta. Solo cambia cuánto se espera, no lo que se comprueba.
if (typeof document !== 'undefined') {
  const { configure } = await import('@testing-library/react');
  configure({ asyncUtilTimeout: 5_000 });
}

afterEach(async () => {
  if (typeof document === 'undefined') return;
  const { cleanup } = await import('@testing-library/react');
  cleanup();
});
