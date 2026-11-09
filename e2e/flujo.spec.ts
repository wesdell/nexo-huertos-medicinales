import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Requiere la aplicación con los datos demo: docker compose up --build
const CLAVE = process.env.DEMO_PASSWORD ?? 'HuertoDemo2026';

/** Falla si axe encuentra violaciones serias o críticas de WCAG 2.1 AA en la página actual. */
async function sinViolaciones(page: Page) {
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Los mosaicos de OpenStreetMap son contenido de terceros.
    .exclude('.leaflet-container')
    .analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

async function ingresar(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/panel$/);
}

test('público: portada, mapa, ranking, estadísticas, plantas, saberes, foro y solicitud', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Huertos medicinales comunitarios');
  await expect(page.getByText('Huertos activos')).toBeVisible();
  await sinViolaciones(page);

  for (const [ruta, titulo] of [
    ['/mapa', 'Mapa de huertos'],
    ['/ranking', 'Ranking de huertos'],
    ['/estadisticas', 'Estadísticas'],
    ['/plantas', 'Catálogo de plantas medicinales'],
    ['/saberes', 'Saberes ancestrales del huerto'],
    ['/foro', 'Foro de saberes'],
    ['/puntos', 'Cómo funcionan los puntos'],
  ]) {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
    await sinViolaciones(page);
  }

  // Ficha pública con espejo digital
  await page.goto('/ranking');
  await page.getByRole('link', { name: 'Huerto Sumak Kawsay' }).first().click();
  await expect(page.getByRole('heading', { name: 'Huerto virtual' })).toBeVisible();
  await sinViolaciones(page);

  // Solicitud: errores claros y envío
  await page.goto('/solicitar');
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page.getByRole('alert')).toContainText('El nombre del huerto es obligatorio');
  await sinViolaciones(page);
});

test('responsable: panel, actividades y registro de un paso con evidencia', async ({ page }) => {
  await ingresar(page, 'demo@nexo.test');
  await expect(page.getByRole('heading', { name: /Hola, Rosa/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Qué sigue en cada planta' })).toBeVisible();
  await sinViolaciones(page);

  for (const [ruta, titulo] of [
    ['/panel/ciclos', 'Actividades'],
    ['/panel/voluntarios', 'Voluntarios'],
    ['/panel/plantas', 'Plantas del huerto'],
    ['/panel/misiones', 'Misiones y puntos'],
    ['/panel/bodega', 'Bodega'],
    ['/panel/produccion', 'Producción'],
    ['/panel/huerto', 'Datos del huerto'],
  ]) {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
    await sinViolaciones(page);
  }

  // Registrar un riego (repetible) en el ciclo de toronjil
  await page.goto('/panel/registrar');
  await page.getByRole('link', { name: /Toronjil/ }).click();
  await page.getByLabel(/^Riego/).check();
  await page.getByRole('button', { name: 'Registrar actividad' }).click();
  await expect(page.getByRole('alert')).toContainText('Marca quién participó');
  await page.getByLabel('Método de riego').selectOption('REGADERA');
  await page.getByLabel('Rosa Cachimuel').fill('1');
  await page.locator('input[type=file]').setInputFiles({
    name: 'riego.png',
    mimeType: 'image/png',
    buffer: Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000', 'hex'),
  });
  await sinViolaciones(page);
  await page.getByRole('button', { name: 'Registrar actividad' }).click();
  const aviso = page.getByRole('button', { name: 'Registrar de todas formas' });
  // Según la hora en que corra la prueba puede haber recomendaciones del calendario: se confirman.
  await Promise.race([aviso.waitFor().then(() => aviso.click()), page.waitForURL(/\/panel\/virtual/)]).catch(() => undefined);
  await expect(page).toHaveURL(/\/panel\/virtual/);
  await expect(page.getByText(/Los puntos llegarán cuando el MSP valide/)).toBeVisible();
  await sinViolaciones(page);
});

test('técnico del MSP: bandejas y validación de una evidencia', async ({ page }) => {
  await ingresar(page, 'tecnico@nexo.test');
  await expect(page.getByRole('heading', { name: 'Panel del MSP' })).toBeVisible();
  await sinViolaciones(page);
  for (const [ruta, titulo] of [
    ['/panel/solicitudes', 'Solicitudes de huerto'],
    ['/panel/catalogo', 'Catálogo de plantas'],
    ['/panel/niveles', 'Niveles por experiencia'],
    ['/panel/registro', 'Registro de huertos'],
    ['/panel/moderacion', 'Moderación del foro'],
    ['/panel/evidencias', 'Evidencias'],
  ]) {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible();
    await sinViolaciones(page);
  }
  const validar = page.getByRole('button', { name: 'Evidencia válida' }).first();
  if (await validar.isVisible()) {
    await validar.click();
    await expect(page.getByText(/Evidencia aprobada: \+\d+ puntos/)).toBeVisible();
  }
});

test('administrador: estado del sistema y cuentas', async ({ page }) => {
  await ingresar(page, 'admin@nexo.test');
  await expect(page.getByRole('heading', { name: 'Estado del sistema' })).toBeVisible();
  await sinViolaciones(page);
  await page.goto('/panel/usuarios');
  await expect(page.getByRole('heading', { name: 'Cuentas' })).toBeVisible();
  await sinViolaciones(page);
});
