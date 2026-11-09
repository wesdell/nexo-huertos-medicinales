import { defineConfig, devices } from '@playwright/test';

// Requiere la aplicación corriendo: docker compose up --build
export default defineConfig({
  testDir: 'e2e',
  // Las pruebas comparten los datos demo (validan evidencias): una a la vez.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:5173', locale: 'es-EC', trace: 'retain-on-failure' },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'] } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
});
