import { defineConfig } from 'vite';
import { tavelyoViteConfig } from '@tavelyo/pwa-shell/vite';

export default defineConfig(
  tavelyoViteConfig({
    name: 'Tavelyo Operaciones',
    shortName: 'Operaciones',
    description: 'Meseros, cocina, caja y administración del restaurante.',
    port: 5174,
  }),
);
