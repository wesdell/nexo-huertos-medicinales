// Capturas de las pantallas en móvil (390) y escritorio (1440) para revisión de diseño y presentación.
// Uso: node e2e/capturas.mjs [carpeta]   (requiere docker compose up y las cuentas demo de .env.example)
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const salida = process.argv[2] ?? 'docs/capturas';
mkdirSync(salida, { recursive: true });

const clave = process.env.DEMO_PASSWORD ?? 'HuertoDemo2026';
async function token(email) {
  const res = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: clave }) });
  return (await res.json()).token;
}
const T = {
  resp: await token(process.env.DEMO_EMAIL ?? 'demo@nexo.test'),
  msp: await token(process.env.TECNICO_EMAIL ?? 'tecnico@nexo.test'),
  admin: await token(process.env.ADMIN_EMAIL ?? 'admin@nexo.test'),
};

// [archivo, ruta, cuenta]
const PANTALLAS = [
  ['publico-portada', '/', null],
  ['publico-mapa', '/mapa', null],
  ['publico-ficha', null, null],
  ['publico-ranking', '/ranking', null],
  ['publico-estadisticas', '/estadisticas', null],
  ['publico-saberes', '/saberes', null],
  ['publico-plantas', '/plantas', null],
  ['publico-foro', '/foro', null],
  ['publico-solicitar', '/solicitar', null],
  ['login', '/login', null],
  ['responsable-inicio', '/panel', 'resp'],
  ['responsable-actividades', '/panel/ciclos', 'resp'],
  ['responsable-registrar', '/panel/registrar', 'resp'],
  ['responsable-voluntarios', '/panel/voluntarios', 'resp'],
  ['responsable-plantas', '/panel/plantas', 'resp'],
  ['responsable-virtual', '/panel/virtual', 'resp'],
  ['responsable-misiones', '/panel/misiones', 'resp'],
  ['responsable-bodega', '/panel/bodega', 'resp'],
  ['msp-resumen', '/panel', 'msp'],
  ['msp-solicitudes', '/panel/solicitudes', 'msp'],
  ['msp-evidencias', '/panel/evidencias', 'msp'],
  ['msp-catalogo', '/panel/catalogo', 'msp'],
  ['msp-registro', '/panel/registro', 'msp'],
  ['admin-estado', '/panel', 'admin'],
];
const VISTAS = [
  ['movil', { width: 390, height: 844 }, 3],
  ['escritorio', { width: 1440, height: 900 }, 1],
];

const navegador = await chromium.launch({ args: ['--lang=es-EC'] });
for (const [vista, viewport, deviceScaleFactor] of VISTAS) {
  const ctx = await navegador.newContext({ viewport, deviceScaleFactor, reducedMotion: 'reduce', locale: 'es-EC' });
  const page = await ctx.newPage();
  const huertos = await (await fetch(`${BASE}/api/publico/ranking?tipo=EN_TIERRA`)).json();
  for (const [nombre, ruta, cuenta] of PANTALLAS) {
    await page.goto(`${BASE}/privacidad`);
    await page.evaluate((t) => (t ? localStorage.setItem('nexo.token', t) : localStorage.clear()), cuenta ? T[cuenta] : null);
    await page.goto(BASE + (ruta ?? `/huertos/${huertos[0].id}`));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    if (nombre === 'responsable-registrar') {
      await page.getByRole('link', { name: /Toronjil/ }).click();
      await page.waitForLoadState('networkidle');
    }
    await page.screenshot({ path: `${salida}/${nombre}-${vista}.png`, fullPage: true });
  }
  await ctx.close();
}
await navegador.close();
console.log(`Capturas en ${salida}`);
