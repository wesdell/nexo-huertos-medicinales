import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Falla si axe encuentra violaciones serias o críticas de WCAG 2.1 AA en la página actual. */
async function sinViolaciones(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
}

test('flujo v1: registro → comunidad → huerto → planta → actividad → huerto virtual', async ({ page }, info) => {
  const email = `e2e+${info.project.name}-${Date.now()}@nexo.test`;

  // HU-001 + HU-036
  await page.goto('/registro');
  await sinViolaciones(page);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page.getByRole('alert')).toContainText('Debes aceptar la política');
  await page.getByLabel('Nombre completo').fill('Persona E2E');
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('clave-e2e-segura');
  await page.getByLabel('Fecha de nacimiento').fill('1992-06-15');
  await page.getByLabel('Género').selectOption('OTRO');
  await page.getByLabel(/Acepto el tratamiento/).check();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  // HU-002
  await expect(page.getByText('Cuenta creada')).toBeVisible();
  await sinViolaciones(page);
  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('clave-e2e-segura');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Inicio sin comunidad + recomendación del día
  await expect(page.getByRole('heading', { name: /Hola, Persona/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Hoy:/ })).toBeVisible();
  await sinViolaciones(page);

  // HU-004
  await page.getByRole('link', { name: 'Crear comunidad' }).click();
  await page.getByLabel('Nombre de la comunidad').fill('Comunidad E2E');
  await sinViolaciones(page);
  await page.getByRole('button', { name: 'Crear comunidad' }).click();

  // HU-010 parcial
  await expect(page.getByRole('heading', { name: 'Registrar el huerto' })).toBeVisible();
  await page.getByLabel('Provincia').selectOption({ label: 'Pichincha' });
  await page.getByLabel('Parroquia').selectOption({ label: 'Quito' });
  await page.getByLabel('Latitud').fill('-0.180653');
  await page.getByLabel('Longitud').fill('-78.467834');
  await sinViolaciones(page);
  await page.getByRole('button', { name: 'Guardar huerto' }).click();

  // HU-014
  await page.getByLabel('Nombre común').fill('Toronjil');
  await page.getByLabel('Ciclo').selectOption('CORTO');
  await page.getByLabel('Cualidad').selectOption('FRIA');
  await page.getByLabel('Usos medicinales').fill('Calmante');
  await page.getByRole('button', { name: 'Agregar planta' }).click();
  await expect(page.getByRole('heading', { name: 'Plantas (1)' })).toBeVisible();
  await sinViolaciones(page);

  // HU-018: preparación con fecha de luna nueva conocida (sin advertencias)
  await page.goto('/actividades/nueva');
  await page.getByText('Preparación de la tierra').click();
  await page.getByLabel('Fecha').fill('2024-04-08');
  await page.getByRole('button', { name: 'Guardar actividad' }).click();
  await expect(page.getByRole('alert')).toContainText('Confirma el retiro de maleza');
  await page.getByLabel(/Retiré la maleza/).check();
  await page.getByLabel(/Esparcí la maleza/).check();
  await page.getByLabel(/Removí la tierra/).check();
  await sinViolaciones(page);
  await page.getByRole('button', { name: 'Guardar actividad' }).click();

  // HU-016 + HU-030
  await expect(page.getByText(/\+15 puntos/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Huerto virtual' })).toBeVisible();
  await expect(page.getByText('Etapa 1: Tierra preparada')).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Progreso del huerto' })).toHaveAttribute('aria-valuenow', '17');
  await sinViolaciones(page);

  // HU-021: siembra fuera de fase muestra el diálogo de advertencias
  await page.goto('/actividades/nueva');
  await page.getByText('Siembra', { exact: true }).click();
  await page.getByLabel('Fecha').fill('2024-04-08');
  await page.getByLabel('Hora').fill('09:00');
  await page.getByLabel('Planta', { exact: true }).selectOption({ label: 'Toronjil' });
  await page.getByLabel('Técnica').selectOption('SURCOS');
  await page.getByLabel('Tipo de siembra').selectOption('SEMILLAS');
  await page.getByRole('button', { name: 'Guardar actividad' }).click();
  const dialogo = page.getByRole('dialog', { name: 'Recomendaciones del calendario ancestral' });
  await expect(dialogo).toContainText('luna creciente o luna llena');
  await sinViolaciones(page);
  await dialogo.getByRole('button', { name: 'Guardar de todas formas' }).click();
  await expect(page.getByText('Etapa 2: Sembrada')).toBeVisible();

  // HU-002: cerrar sesión y ruta protegida
  await page.goto('/');
  await page.getByRole('button', { name: 'Cerrar sesión' }).filter({ visible: true }).click();
  await page.goto('/huerto');
  await expect(page).toHaveURL(/\/login$/);
});
