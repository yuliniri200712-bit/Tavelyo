import { defineConfig } from 'vite';
import { tavelyoViteConfig } from '@tavelyo/pwa-shell/vite';

export default defineConfig(
  tavelyoViteConfig({
    name: 'Tavelyo Menú',
    shortName: 'Tavelyo',
    description: 'Carta y pedidos desde la mesa del restaurante.',
    port: 5173,
  }),
);
