import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const proxy = { '/api': process.env.API_PROXY ?? 'http://localhost:3000' };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Usa el código fuente de @nexo/shared directamente (sin compilarlo a CommonJS).
  resolve: { alias: { '@nexo/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)) } },
  server: { host: true, port: 5173, proxy },
  preview: { host: true, port: 5173, proxy },
});
