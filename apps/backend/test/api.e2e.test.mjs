// Pruebas de la API de punta a punta contra el backend en ejecución (docker compose up).
// Ejecutar: pnpm --filter backend test:e2e   (API_URL por defecto: http://localhost:3000/api)
import assert from 'node:assert/strict';
import { test } from 'node:test';

const API = process.env.API_URL ?? 'http://localhost:3000/api';
const email = `prueba+${Date.now()}@nexo.test`;
let token = '';
let huertoId = '';
let plantaId = '';

async function pedir(ruta, body, metodo) {
  const res = await fetch(API + ruta, {
    method: metodo ?? (body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, datos: await res.json().catch(() => ({})) };
}

const registro = { nombre: 'Persona de Prueba', email, password: 'clave-segura-1', fechaNacimiento: '1990-01-01', genero: 'OTRO' };

test('HU-036: registro sin aceptar la política se rechaza', async () => {
  const r = await pedir('/auth/registro', { ...registro, aceptaPrivacidad: false });
  assert.equal(r.status, 400);
  assert.equal(r.datos.errores[0].campo, 'aceptaPrivacidad');
});

test('HU-001: contraseña corta se rechaza', async () => {
  const r = await pedir('/auth/registro', { ...registro, password: 'corta', aceptaPrivacidad: true });
  assert.equal(r.status, 400);
  assert.equal(r.datos.errores[0].campo, 'password');
});

test('HU-001: registro válido y correo repetido', async () => {
  assert.equal((await pedir('/auth/registro', { ...registro, aceptaPrivacidad: true })).status, 201);
  const repetido = await pedir('/auth/registro', { ...registro, aceptaPrivacidad: true });
  assert.equal(repetido.status, 409);
  assert.equal(repetido.datos.errores[0].campo, 'email');
});

test('HU-002: credenciales incorrectas dan mensaje genérico; las correctas dan token', async () => {
  const mal = await pedir('/auth/login', { email, password: 'otra-clave' });
  assert.equal(mal.status, 401);
  assert.equal(mal.datos.message, 'Correo o contraseña incorrectos.');
  const bien = await pedir('/auth/login', { email, password: registro.password });
  assert.equal(bien.status, 200);
  token = bien.datos.token;
});

test('HU-002: ruta protegida sin token responde 401', async () => {
  const guardado = token;
  token = '';
  assert.equal((await pedir('/auth/yo')).status, 401);
  token = guardado;
});

test('HU-004 y HU-010: crear comunidad (responsable) y huerto', async () => {
  assert.equal((await pedir('/comunidades', { nombre: 'Comunidad de prueba' })).status, 201);
  const yo = await pedir('/auth/yo');
  assert.equal(yo.datos.comunidad.esResponsable, true);

  const malaParroquia = await pedir('/huertos', { provinciaId: 1, parroquiaId: 1701, latitud: -0.2, longitud: -78.5 });
  assert.equal(malaParroquia.status, 400);

  const h = await pedir('/huertos', { provinciaId: 17, parroquiaId: 1701, latitud: -0.2, longitud: -78.5 });
  assert.equal(h.status, 201);
  huertoId = h.datos.id;
});

test('HU-014: registrar planta', async () => {
  const p = await pedir(`/huertos/${huertoId}/plantas`, {
    nombreComun: 'Manzanilla',
    ciclo: 'CORTO',
    cualidad: 'FRIA',
    usosMedicinales: 'Digestivo',
  });
  assert.equal(p.status, 201);
  plantaId = p.datos.id;
});

test('HU-016: huerto sin actividades está en estado inicial', async () => {
  const v = await pedir(`/huertos/${huertoId}/virtual`);
  assert.equal(v.datos.progreso, 0);
  assert.equal(v.datos.plantas[0].etapa.nivel, 0);
});

test('HU-018 y HU-030: datos incompletos se rechazan sin puntos', async () => {
  const r = await pedir(`/huertos/${huertoId}/actividades`, { tipo: 'PREPARACION_TIERRA', fecha: '2024-04-08', detalle: {} });
  assert.equal(r.status, 400);
  assert.deepEqual(
    r.datos.errores.map((e) => e.campo),
    ['retiroMaleza', 'esparcido', 'remocion'],
  );
});

test('HU-018 y HU-030: preparación en luna nueva suma base + bono', async () => {
  const r = await pedir(`/huertos/${huertoId}/actividades`, {
    tipo: 'PREPARACION_TIERRA',
    fecha: '2024-04-08',
    detalle: { retiroMaleza: true, esparcido: true, remocion: true },
  });
  assert.equal(r.status, 201);
  assert.deepEqual(r.datos.puntos, { base: 10, bono: 5 });
});

test('HU-021: siembra fuera de fase pide confirmación y, confirmada, suma sin bono', async () => {
  const siembra = {
    tipo: 'SIEMBRA',
    fecha: '2024-04-08',
    hora: '08:30',
    plantaId,
    detalle: { tecnica: 'SURCOS', tipoSiembra: 'SEMILLAS' },
  };
  const aviso = await pedir(`/huertos/${huertoId}/actividades`, siembra);
  assert.equal(aviso.status, 409);
  assert.equal(aviso.datos.advertencias[0].codigo, 'FASE_LUNAR');

  const ok = await pedir(`/huertos/${huertoId}/actividades`, { ...siembra, confirmarAdvertencias: true });
  assert.equal(ok.status, 201);
  assert.deepEqual(ok.datos.puntos, { base: 15, bono: 0 });
});

test('HU-030: repetir la misma actividad el mismo día no suma puntos', async () => {
  const r = await pedir(`/huertos/${huertoId}/actividades`, {
    tipo: 'PREPARACION_TIERRA',
    fecha: '2024-04-08',
    detalle: { retiroMaleza: true, esparcido: true, remocion: true },
  });
  assert.equal(r.status, 201);
  assert.equal(r.datos.repetida, true);
  assert.deepEqual(r.datos.puntos, { base: 0, bono: 0 });
});

test('HU-016: el huerto virtual refleja la siembra y los puntos se acumulan', async () => {
  const v = await pedir(`/huertos/${huertoId}/virtual`);
  assert.equal(v.datos.plantas[0].etapa.nombre, 'Sembrada');
  assert.equal(v.datos.progreso, 33);
  const yo = await pedir('/auth/yo');
  assert.equal(yo.datos.puntos, 30);
  assert.equal(yo.datos.comunidad.puntosTotales, 30);
});
