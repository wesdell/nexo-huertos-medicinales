// Pruebas de la API de punta a punta contra el backend en ejecución (docker compose up).
// Ejecutar: pnpm --filter backend test:e2e
// API_URL por defecto http://localhost:3000/api; MAILPIT_URL por defecto http://localhost:8025 (lee la clave temporal).
import assert from 'node:assert/strict';
import { test } from 'node:test';

const API = process.env.API_URL ?? 'http://localhost:3000/api';
const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';
const CLAVE_DEMO = process.env.DEMO_PASSWORD ?? 'HuertoDemo2026';
const sello = Date.now();
const email = `e2e+${sello}@nexo.test`;
const tokens = {};
const ctx = {};

/** Cédula válida aleatoria (provincia 17, módulo 10). */
function cedula() {
  // El tercer dígito debe ser menor que 6 (personas naturales).
  const base = `17${Math.floor(Math.random() * 6)}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`;
  const suma = [...base].reduce((s, c, i) => {
    const n = Number(c) * (i % 2 === 0 ? 2 : 1);
    return s + (n > 9 ? n - 9 : n);
  }, 0);
  return base + ((10 - (suma % 10)) % 10);
}

async function pedir(ruta, { body, metodo, como, form } = {}) {
  const res = await fetch(API + ruta, {
    method: metodo ?? (body || form ? 'POST' : 'GET'),
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(como ? { Authorization: `Bearer ${tokens[como]}` } : {}) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  return { status: res.status, datos: await res.json().catch(() => ({})) };
}

const login = async (correo, password) => (await pedir('/auth/login', { body: { email: correo, password } })).datos;
const foto = () => new Blob([Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])], { type: 'image/png' });
function multipart(datos, conFoto = true) {
  const f = new FormData();
  f.append('datos', JSON.stringify(datos));
  if (conFoto) f.append('evidencias', foto(), 'evidencia.png');
  return f;
}

const solicitud = {
  nombreHuerto: `Huerto E2E ${sello}`,
  tipo: 'EN_TIERRA',
  subtipos: ['SURCO'],
  provinciaId: 17,
  parroquiaId: 1701,
  latitud: -0.18,
  longitud: -78.47,
  altitud: 300, // baja a propósito: la manzanilla (1500–3500 m) queda fuera de rango
  nombreResponsable: 'Persona E2E',
  cedula: cedula(),
  email,
  celular: '0991234567',
  aceptaPrivacidad: true,
};

test('setup: cuentas demo del MSP', async () => {
  tokens.tecnico = (await login('tecnico@nexo.test', CLAVE_DEMO)).token;
  tokens.admin = (await login('admin@nexo.test', CLAVE_DEMO)).token;
  assert.ok(tokens.tecnico && tokens.admin);
});

test('Solicitud pública: valida cédula, celular, subtipos y consentimiento', async () => {
  const r = await pedir('/publico/solicitudes', {
    body: { ...solicitud, cedula: '1234567890', celular: '022345678', subtipos: ['PARED'], aceptaPrivacidad: false },
  });
  assert.equal(r.status, 400);
  const campos = r.datos.errores.map((e) => e.campo);
  assert.ok(campos.includes('cedula') && campos.includes('celular') && campos.includes('aceptaPrivacidad'));
  const sub = await pedir('/publico/solicitudes', { body: { ...solicitud, subtipos: ['PARED'] } });
  assert.equal(sub.status, 400);
  assert.equal(sub.datos.errores[0].campo, 'subtipos');
});

test('Solicitud pública: se crea y no se duplica mientras está pendiente', async () => {
  assert.equal((await pedir('/publico/solicitudes', { body: solicitud })).status, 201);
  assert.equal((await pedir('/publico/solicitudes', { body: solicitud })).status, 409);
});

test('Roles: sin token 401; el público no entra al panel del MSP', async () => {
  assert.equal((await pedir('/msp/resumen')).status, 401);
  assert.equal((await pedir('/admin/estado', { como: 'tecnico' })).status, 403);
});

test('Técnico aprueba: llega la clave temporal por correo y obliga a cambiarla', async () => {
  const pendientes = (await pedir('/msp/solicitudes', { como: 'tecnico' })).datos;
  const s = pendientes.find((x) => x.email === email);
  const ap = await pedir(`/msp/solicitudes/${s.id}/aprobar`, { metodo: 'POST', como: 'tecnico' });
  assert.equal(ap.status, 200);
  assert.equal(ap.datos.cuentaNueva, true);
  ctx.huertoId = ap.datos.huertoId;

  const lista = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`).then((r) => r.json());
  const msg = await fetch(`${MAILPIT}/api/v1/message/${lista.messages[0].ID}`).then((r) => r.json());
  const temporal = /Contraseña temporal: (\S+)/.exec(msg.Text)[1];

  const l = await login(email, temporal);
  assert.equal(l.debeCambiarClave, true);
  tokens.resp = l.token;
  assert.equal((await pedir(`/huertos/${ctx.huertoId}`, { como: 'resp' })).status, 403);
  const corta = await pedir('/auth/clave', { body: { actual: temporal, nueva: 'corta' }, como: 'resp' });
  assert.equal(corta.datos.errores[0].campo, 'nueva');
  assert.equal((await pedir('/auth/clave', { body: { actual: temporal, nueva: 'clave-e2e-segura' }, como: 'resp' })).status, 200);
  assert.equal((await pedir(`/huertos/${ctx.huertoId}`, { como: 'resp' })).status, 200);
});

test('Responsable: voluntarios sin cuenta y nivel por experiencia', async () => {
  const sinNombre = await pedir(`/huertos/${ctx.huertoId}/voluntarios`, { body: { fechaNacimiento: '1990-01-01', genero: 'OTRO' }, como: 'resp' });
  assert.equal(sinNombre.status, 400);
  const v = await pedir(`/huertos/${ctx.huertoId}/voluntarios`, {
    body: { nombre: 'Voluntaria E2E', fechaNacimiento: '1990-01-01', genero: 'FEMENINO', nivelSolicitado: 'OFICIAL', justificacion: 'Cultiva plantas medicinales hace diez años en su comunidad.' },
    como: 'resp',
  });
  assert.equal(v.status, 201);
  ctx.voluntarioId = v.datos.id;
  const niveles = (await pedir('/msp/niveles', { como: 'tecnico' })).datos;
  assert.ok(niveles.some((n) => n.voluntario.nombre === 'Voluntaria E2E'));
});

test('Responsable: planta de otra altitud pide confirmación', async () => {
  const cat = (await pedir(`/huertos/${ctx.huertoId}/catalogo`, { como: 'resp' })).datos;
  const manzanilla = cat.plantas.find((p) => p.nombreComun === 'Manzanilla');
  assert.equal(manzanilla.apta, false);
  const aviso = await pedir(`/huertos/${ctx.huertoId}/plantas`, { body: { plantaId: manzanilla.id }, como: 'resp' });
  assert.equal(aviso.status, 409);
  assert.equal(aviso.datos.advertencias[0].codigo, 'ALTITUD');
  const ok = await pedir(`/huertos/${ctx.huertoId}/plantas`, { body: { plantaId: manzanilla.id, confirmarAltitud: true }, como: 'resp' });
  assert.equal(ok.status, 201);
  assert.equal(ok.datos.fueraDeAltitud, true);
  const c = await pedir(`/huertos/${ctx.huertoId}/ciclos`, { body: { plantaId: manzanilla.id }, como: 'resp' });
  assert.equal(c.status, 201);
  ctx.cicloId = c.datos.id;
});

test('Actividades: orden de los pasos, evidencia obligatoria y máximo 24 h por día', async () => {
  const p = (h) => [{ voluntarioId: ctx.voluntarioId, horas: h }];
  const prep = { tipo: 'PREPARACION_TIERRA', fecha: '2024-04-08', participantes: p(2), detalle: { retiroMaleza: true, esparcido: true, remocion: true } };
  const fueraDeOrden = await pedir(`/ciclos/${ctx.cicloId}/actividades`, { form: multipart({ ...prep, tipo: 'SIEMBRA' }), como: 'resp' });
  assert.equal(fueraDeOrden.status, 409);
  const sinFoto = await pedir(`/ciclos/${ctx.cicloId}/actividades`, { form: multipart(prep, false), como: 'resp' });
  assert.equal(sinFoto.datos.errores[0].campo, 'evidencias');
  const muchas = await pedir(`/ciclos/${ctx.cicloId}/actividades`, { form: multipart({ ...prep, participantes: p(25) }), como: 'resp' });
  assert.match(muchas.datos.errores[0].mensaje, /24 horas/);
  const ok = await pedir(`/ciclos/${ctx.cicloId}/actividades`, { form: multipart(prep), como: 'resp' });
  assert.equal(ok.status, 201);
  assert.equal(ok.datos.conBono, true);
  assert.equal(ok.datos.siguiente.tipo, 'ESTRUCTURA_SIEMBRA');
  ctx.actividadId = ok.datos.id;
});

test('Evidencia: rechazo, segunda oportunidad y puntos a la mitad (+10 % de bono)', async () => {
  const sinMotivo = await pedir(`/msp/evidencias/${ctx.actividadId}/rechazar`, { body: {}, como: 'tecnico' });
  assert.equal(sinMotivo.status, 400);
  const r = await pedir(`/msp/evidencias/${ctx.actividadId}/rechazar`, { body: { motivo: 'La foto no muestra el huerto.' }, como: 'tecnico' });
  assert.equal(r.datos.puedeReenviar, true);
  const f = new FormData();
  f.append('evidencias', foto(), 'nueva.png');
  const re = await pedir(`/actividades/${ctx.actividadId}/evidencia`, { form: f, como: 'resp' });
  assert.equal(re.datos.intento, 2);
  const ap = await pedir(`/msp/evidencias/${ctx.actividadId}/aprobar`, { metodo: 'POST', como: 'tecnico' });
  assert.equal(ap.datos.puntos, 11); // 2 h × 10 × 50 % × 1,1
  const vols = (await pedir(`/huertos/${ctx.huertoId}/voluntarios`, { como: 'resp' })).datos;
  assert.equal(vols[0].puntos, 11);
  assert.equal(vols[0].horas, 2);
});

test('Paso no cumplido y ciclo fallido con causa', async () => {
  const om = await pedir(`/ciclos/${ctx.cicloId}/omitir`, { body: { tipo: 'ESTRUCTURA_SIEMBRA' }, como: 'resp' });
  assert.equal(om.status, 200);
  assert.equal(om.datos.siguiente.tipo, 'RITUAL_SIEMBRA');
  const sinCausa = await pedir(`/ciclos/${ctx.cicloId}/fracaso`, { body: { justificacion: 'x' }, como: 'resp' });
  assert.equal(sinCausa.status, 400);
  const f = await pedir(`/ciclos/${ctx.cicloId}/fracaso`, { body: { causa: 'HELADA', justificacion: 'Helada nocturna.' }, como: 'resp' });
  assert.equal(f.datos.estado, 'FALLIDO');
  const ciclos = (await pedir(`/huertos/${ctx.huertoId}/ciclos`, { como: 'resp' })).datos;
  assert.equal(ciclos[0].actividades.find((a) => a.tipo === 'ESTRUCTURA_SIEMBRA').cumplida, false);
});

test('Público: ficha, ranking normalizado y estadísticas sin datos personales', async () => {
  const ficha = await pedir(`/publico/huertos/${ctx.huertoId}`);
  assert.equal(ficha.status, 200);
  assert.equal(ficha.datos.email, undefined);
  assert.equal(ficha.datos.latitud, -0.18);
  const ranking = (await pedir('/publico/ranking?tipo=EN_TIERRA')).datos;
  const fila = ranking.find((r) => r.id === ctx.huertoId);
  assert.equal(fila.indice, Math.round((fila.puntos / Math.sqrt(fila.voluntarios + 1)) * 10) / 10);
  const stats = (await pedir('/publico/estadisticas')).datos;
  assert.equal(stats.porProvincia.length, 24);
  assert.equal((await pedir('/publico/ranking?tipo=OTRO')).status, 400);
});

test('Foro: reglas obligatorias, reporte y moderación del MSP', async () => {
  const sinReglas = await pedir('/foro', { body: { categoria: 'SABERES', titulo: 'Hola', contenido: 'Un saber sobre la ruda.' }, como: 'resp' });
  assert.equal(sinReglas.status, 400);
  const a = await pedir('/foro', { body: { categoria: 'SABERES', titulo: 'Ruda', contenido: 'La ruda protege el huerto.', aceptaReglas: true }, como: 'resp' });
  assert.equal(a.status, 201);
  assert.equal((await pedir(`/foro/${a.datos.id}/reportar`, { metodo: 'POST', como: 'resp' })).status, 200);
  assert.equal((await pedir(`/foro/${a.datos.id}/retirar`, { body: { motivo: 'Prueba de moderación' }, como: 'resp' })).status, 403);
  assert.equal((await pedir(`/foro/${a.datos.id}/retirar`, { body: { motivo: 'Prueba de moderación' }, como: 'tecnico' })).status, 200);
  const hilo = (await pedir(`/foro/${a.datos.id}`)).datos;
  assert.equal(hilo.retirado, true);
  assert.equal(hilo.contenido, '');
});

test('Administrador: estado del sistema y respaldo con pg_dump', async () => {
  const e = await pedir('/admin/estado', { como: 'admin' });
  assert.equal(e.status, 200);
  assert.ok(e.datos.baseDatos.tablas.length > 10);
  const res = await fetch(`${API}/admin/respaldo`, { headers: { Authorization: `Bearer ${tokens.admin}` } });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /PostgreSQL database dump/);
});
