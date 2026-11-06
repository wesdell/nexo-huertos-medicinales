// Capturas de las pantallas v1 en móvil (390) y escritorio (1440) para revisión de diseño y presentación.
// Uso: node e2e/capturas.mjs [carpeta]   (requiere docker compose up y la cuenta demo de .env.example)
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const salida = process.argv[2] ?? 'docs/capturas';
mkdirSync(salida, { recursive: true });

const res = await fetch(`${BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.DEMO_EMAIL ?? 'demo@nexo.test', password: process.env.DEMO_PASSWORD ?? 'HuertoDemo2026' }),
});
const { token } = await res.json();

const PANTALLAS = [
  ['login', '/login', false],
  ['registro', '/registro', false],
  ['inicio', '/', true],
  ['huerto', '/huerto', true],
  ['actividad', '/actividades/nueva', true],
  ['huerto-virtual', '/huerto/virtual', true],
];
const VISTAS = [
  ['movil', { width: 390, height: 844 }, 3],
  ['escritorio', { width: 1440, height: 900 }, 1],
];

const navegador = await chromium.launch();
for (const [vista, viewport, deviceScaleFactor] of VISTAS) {
  const ctx = await navegador.newContext({ viewport, deviceScaleFactor, reducedMotion: 'reduce', locale: 'es-EC' });
  const page = await ctx.newPage();
  for (const [nombre, ruta, conSesion] of PANTALLAS) {
    await page.goto(`${BASE}/login`);
    await page.evaluate((t) => (t ? localStorage.setItem('nexo.token', t) : localStorage.clear()), conSesion ? token : null);
    await page.goto(BASE + ruta);
    await page.waitForLoadState('networkidle');
    if (nombre === 'actividad') await page.getByText('Siembra', { exact: true }).click();
    await page.screenshot({ path: `${salida}/${nombre}-${vista}.png`, fullPage: true });
  }
  await ctx.close();
}
await navegador.close();
console.log(`Capturas en ${salida}`);
