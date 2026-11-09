// Recorre el flujo básico completo en la interfaz y guarda una captura por paso para el informe.
// Uso: node e2e/capturas-flujo.mjs [carpeta]   (requiere docker compose up con los datos demo)
// Crea una solicitud real, la aprueba, lee el correo en Mailpit y registra un paso: después
// conviene volver a los datos demo con `docker compose down -v && docker compose up --build -d`.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';
const CLAVE = process.env.DEMO_PASSWORD ?? 'HuertoDemo2026';
const salida = process.argv[2] ?? 'docs/informe/img';
mkdirSync(salida, { recursive: true });

// Correo fijo: el script se ejecuta sobre los datos demo recién cargados.
const correo = process.env.CORREO_FLUJO ?? `rosa.quishpe@nexo.test`;
function cedula() {
  const base = `17${Math.floor(Math.random() * 6)}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;
  const suma = [...base].reduce((s, c, i) => {
    const n = Number(c) * (i % 2 === 0 ? 2 : 1);
    return s + (n > 9 ? n - 9 : n);
  }, 0);
  return base + ((10 - (suma % 10)) % 10);
}

const navegador = await chromium.launch({ args: ['--lang=es-EC'] });
const ctx = await navegador.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, reducedMotion: 'reduce', locale: 'es-EC' });
const page = await ctx.newPage();
let n = 0;
async function foto(nombre, { completa = false, esperar = 600 } = {}) {
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(esperar);
  const archivo = `${salida}/${String(++n).padStart(2, '0')}-${nombre}.png`;
  await page.screenshot({ path: archivo, fullPage: completa });
  console.log(archivo);
}
async function ingresar(email, clave = CLAVE) {
  await page.goto(`${BASE}/privacidad`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/login`);
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/panel/);
}

// 1. Portada pública
await page.goto(BASE);
await foto('portada');

// 2. Solicitud pública del huerto
await page.goto(`${BASE}/solicitar`);
await page.getByLabel('Nombre del huerto').fill('Huerto Allpa Mama');
await page.getByLabel('Tipo de huerto').selectOption('EN_TIERRA');
await page.getByLabel('Surco').check().catch(() => undefined);
await page.getByLabel('Provincia').selectOption('17');
await page.getByLabel('Parroquia').selectOption('1705');
await page.getByLabel('Latitud').fill('-0.098');
await page.getByLabel('Longitud').fill('-78.422');
await page.getByLabel('Altitud (m)').fill('2850');
await page.getByLabel('Nombre completo').fill('Rosa Quishpe');
await page.getByLabel('Cédula').fill(cedula());
await page.getByLabel('Celular').fill('0991234567');
await page.getByLabel('Correo').fill(correo);
await page.getByLabel(/Acepto el tratamiento/).check();
await foto('solicitud-formulario', { completa: true });
await page.getByRole('button', { name: 'Enviar solicitud' }).click();
await page.getByRole('heading', { name: 'Solicitud enviada' }).waitFor();
await foto('solicitud-enviada');

// 3. El técnico del MSP revisa y aprueba
await ingresar('tecnico@nexo.test');
await foto('msp-resumen');
await page.goto(`${BASE}/panel/solicitudes`);
const tarjeta = page.locator('li, article').filter({ hasText: 'Huerto Allpa Mama' }).first();
await tarjeta.scrollIntoViewIfNeeded();
await foto('msp-solicitud-pendiente');
await tarjeta.getByRole('button', { name: 'Aprobar huerto y responsable' }).click();
await page.getByText(/correo/i).first().waitFor();
await foto('msp-solicitud-aprobada');

// 4. Llega el correo con la contraseña temporal (Mailpit)
const busqueda = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${correo}`)}`).then((r) => r.json());
const id = busqueda.messages[0].ID;
const mensaje = await fetch(`${MAILPIT}/api/v1/message/${id}`).then((r) => r.json());
const temporal = mensaje.Text.match(/Contraseña temporal:\s*(\S+)/)[1];
await page.goto(`${MAILPIT}/view/${id}`);
await foto('correo-credenciales', { esperar: 1200 });

// 5. Primer ingreso: cambio obligatorio de contraseña
await ingresar(correo, temporal);
await page.waitForURL(/\/panel\/clave/);
await foto('cambio-clave');
await page.getByLabel('Contraseña actual (la del correo)').fill(temporal);
await page.getByLabel('Nueva contraseña', { exact: true }).fill('HuertoNuevo2026');
await page.getByLabel('Repite la nueva contraseña').fill('HuertoNuevo2026');
await page.getByRole('button', { name: 'Guardar contraseña' }).click();
await page.waitForURL(/\/panel$/);
await foto('responsable-nuevo-inicio');

// 6. Plantas filtradas por altitud: una de otra altitud pide confirmación
await page.goto(`${BASE}/panel/plantas`);
await foto('plantas-por-altitud');
await page.getByLabel('Mostrar también las de otra altitud').check();
const guayusa = page.locator('li, article').filter({ hasText: 'Guayusa' }).first();
await guayusa.getByRole('button', { name: 'Agregar' }).click();
await page.getByRole('dialog').waitFor();
await foto('planta-fuera-de-altitud');
await page.getByRole('button', { name: 'Elegir otra' }).click();

// 7. Huerto demo con historia: voluntarios, actividades y registro de un paso
await ingresar('demo@nexo.test');
await foto('responsable-inicio');
await page.goto(`${BASE}/panel/voluntarios`);
await foto('voluntarios');
await page.goto(`${BASE}/panel/ciclos`);
await foto('actividades-ciclos');
await page.goto(`${BASE}/panel/registrar`);
await page.getByRole('link', { name: /Toronjil/ }).click();
await page.getByLabel(/^Riego/).check();
await page.getByLabel('Método de riego').selectOption('REGADERA');
await page.getByLabel('Rosa Cachimuel').fill('2');
// Evidencia de ejemplo: la ilustración de la etapa «en cuidado» convertida a PNG.
const lienzo = await ctx.newPage();
await lienzo.setViewportSize({ width: 480, height: 360 });
await lienzo.goto(`${BASE}/etapas/etapa-3-en-cuidado.svg`);
const png = await lienzo.screenshot();
await lienzo.close();
await page.locator('input[type=file]').setInputFiles({ name: 'riego-toronjil.png', mimeType: 'image/png', buffer: png });
await foto('registrar-paso', { completa: true });
await page.getByRole('button', { name: 'Registrar actividad' }).click();
const aviso = page.getByRole('button', { name: 'Registrar de todas formas' });
const hayAviso = await aviso.waitFor({ timeout: 4000 }).then(() => true).catch(() => false);
if (hayAviso) {
  await foto('registrar-advertencia');
  await aviso.click();
}
await page.waitForURL(/\/panel\/virtual/);
await foto('huerto-virtual');

// 8. El técnico valida la evidencia y se acreditan los puntos
await ingresar('tecnico@nexo.test');
await page.goto(`${BASE}/panel/evidencias`);
await foto('msp-evidencias');
await page.getByRole('button', { name: 'Evidencia válida' }).first().click();
await page.getByText(/Evidencia aprobada: \+\d+ puntos/).waitFor();
await foto('msp-evidencia-aprobada');
for (const [ruta, nombre] of [
  ['/panel/catalogo', 'msp-catalogo'],
  ['/panel/niveles', 'msp-niveles'],
  ['/panel/registro', 'msp-registro'],
  ['/panel/moderacion', 'msp-moderacion'],
]) {
  await page.goto(BASE + ruta);
  await foto(nombre);
}

// 9. Puntos, misiones, bodega y producción del responsable
await ingresar('demo@nexo.test');
for (const [ruta, nombre] of [
  ['/panel/misiones', 'misiones-puntos'],
  ['/panel/bodega', 'bodega'],
  ['/panel/produccion', 'produccion'],
  ['/panel/huerto', 'datos-huerto'],
]) {
  await page.goto(BASE + ruta);
  await foto(nombre);
}

// 10. Lo que ve el público
await page.evaluate(() => localStorage.clear());
for (const [ruta, nombre] of [
  ['/mapa', 'publico-mapa'],
  ['/ranking', 'publico-ranking'],
  ['/estadisticas', 'publico-estadisticas'],
  ['/plantas', 'publico-plantas'],
  ['/saberes', 'publico-saberes'],
  ['/foro', 'publico-foro'],
]) {
  await page.goto(BASE + ruta);
  await foto(nombre, { esperar: 1200 });
}
await page.goto(`${BASE}/ranking`);
await page.getByRole('link', { name: 'Huerto Sumak Kawsay' }).first().click();
await foto('publico-ficha', { esperar: 1200 });

// 11. Administrador técnico
await ingresar('admin@nexo.test');
await foto('admin-estado');
await page.goto(`${BASE}/panel/usuarios`);
await foto('admin-cuentas');

await navegador.close();
