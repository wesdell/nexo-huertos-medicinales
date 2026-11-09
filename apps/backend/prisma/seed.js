// Seed: provincias y parroquias (siempre) y datos de demostración (solo si la base no tiene usuarios).
// Las cuentas demo usan DEMO_PASSWORD (ver .env.example). Solo para desarrollo y la presentación.
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { faseLunar, estadoPasos, puntosParticipacion, nivelPorAvance } = require('@nexo/shared');
const PLANTAS = require('./seed-plantas.json');

const db = new PrismaClient();

// [id INEC, provincia, región, cabecera]
// ponytail: solo la parroquia cabecera de cada provincia (más algunas de Pichincha); el DPA completo del INEC queda fuera de alcance.
const PROVINCIAS = [
  [1, 'Azuay', 'SIERRA', 'Cuenca'],
  [2, 'Bolívar', 'SIERRA', 'Guaranda'],
  [3, 'Cañar', 'SIERRA', 'Azogues'],
  [4, 'Carchi', 'SIERRA', 'Tulcán'],
  [5, 'Cotopaxi', 'SIERRA', 'Latacunga'],
  [6, 'Chimborazo', 'SIERRA', 'Riobamba'],
  [7, 'El Oro', 'COSTA', 'Machala'],
  [8, 'Esmeraldas', 'COSTA', 'Esmeraldas'],
  [9, 'Guayas', 'COSTA', 'Guayaquil'],
  [10, 'Imbabura', 'SIERRA', 'Ibarra'],
  [11, 'Loja', 'SIERRA', 'Loja'],
  [12, 'Los Ríos', 'COSTA', 'Babahoyo'],
  [13, 'Manabí', 'COSTA', 'Portoviejo'],
  [14, 'Morona Santiago', 'AMAZONIA', 'Macas'],
  [15, 'Napo', 'AMAZONIA', 'Tena'],
  [16, 'Pastaza', 'AMAZONIA', 'Puyo'],
  [17, 'Pichincha', 'SIERRA', 'Quito'],
  [18, 'Tungurahua', 'SIERRA', 'Ambato'],
  [19, 'Zamora Chinchipe', 'AMAZONIA', 'Zamora'],
  [20, 'Galápagos', 'GALAPAGOS', 'Puerto Baquerizo Moreno'],
  [21, 'Sucumbíos', 'AMAZONIA', 'Nueva Loja'],
  [22, 'Orellana', 'AMAZONIA', 'Puerto Francisco de Orellana'],
  [23, 'Santo Domingo de los Tsáchilas', 'COSTA', 'Santo Domingo'],
  [24, 'Santa Elena', 'COSTA', 'Santa Elena'],
];
const EXTRA = { 17: ['Conocoto', 'Cumbayá', 'Tumbaco', 'Calderón'], 10: ['Otavalo', 'Cotacachi'], 6: ['Guamote'], 1: ['Paute'] };
const parroquiaId = (prov, nombre) => {
  const lista = [PROVINCIAS.find((p) => p[0] === prov)[3], ...(EXTRA[prov] ?? [])];
  return prov * 100 + lista.indexOf(nombre) + 1; // id interno, no es el código DPA
};

const DIA = 86_400_000;
const hoy = () => new Date(Date.now() - 5 * 3_600_000).toISOString().slice(0, 10);
const sumar = (fecha, dias) => new Date(Date.parse(fecha) + dias * DIA).toISOString().slice(0, 10);
const aFecha = (s) => new Date(`${s}T00:00:00Z`);
/** Primer día desde `fecha` con alguna de las fases dadas (para que la demo siga el calendario lunar). */
function conFase(fecha, fases) {
  for (let i = 0; i < 30; i++) if (fases.includes(faseLunar(sumar(fecha, i)))) return sumar(fecha, i);
  return fecha;
}

// Fotos de evidencia de demostración (ilustraciones SVG; en producción son fotos y videos reales).
const DIR = process.env.UPLOADS_DIR ?? join(process.cwd(), 'uploads');
const COLOR = { tierra: '#8a5a3b', hoja: '#3f7d3a', cielo: '#cfe6f2', sol: '#f2c14e' };
function fotoDemo(nombre, texto, matiz) {
  mkdirSync(DIR, { recursive: true });
  const archivo = `demo-${nombre}.svg`;
  const plantas = Array.from({ length: 7 }, (_, i) => {
    const x = 60 + i * 80;
    return `<path d="M${x} 300 q-14 -40 0 -${50 + (i % 3) * 15} q14 40 0 ${50 + (i % 3) * 15}" fill="${matiz}"/><path d="M${x} 300 q-30 -20 -34 -44 q26 10 34 44" fill="${matiz}" opacity=".8"/>`;
  }).join('');
  writeFileSync(
    join(DIR, archivo),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="${COLOR.cielo}"/><circle cx="560" cy="70" r="38" fill="${COLOR.sol}"/><rect y="280" width="640" height="120" fill="${COLOR.tierra}"/>${plantas}<rect x="16" y="16" width="${texto.length * 11 + 24}" height="40" rx="10" fill="#fff" opacity=".9"/><text x="28" y="43" font-family="sans-serif" font-size="20" fill="#2b2b2b">${texto}</text></svg>`,
  );
  return { tipo: 'FOTO', url: `/api/archivos/${archivo}`, nombre: archivo, mime: 'image/svg+xml', bytes: 2000 };
}

const DETALLE = {
  PREPARACION_TIERRA: { retiroMaleza: true, esparcido: true, remocion: true, abonoOrganico: true },
  ESTRUCTURA_SIEMBRA: { estructura: 'SURCOS' },
  RITUAL_SIEMBRA: {},
  SIEMBRA: { tecnica: 'SURCOS', tipoSiembra: 'PLANTULAS' },
  SENALETICA: { incluyeNombres: true, incluyeUsos: true },
  CUIDADO_CRECIMIENTO: { labores: ['DESHIERBE', 'APORQUE'] },
  RIEGO: { metodo: 'REGADERA' },
  BANO_PREVIO_COSECHA: {},
  RITUAL_GRATITUD: {},
  COSECHA: { parte: 'HOJAS' },
  LIMPIEZA: {},
  SECADO: { lugar: 'COLGADO_SOMBRA', dias: 12 },
  EMPAQUETADO: {},
};
const HORA = { RITUAL_SIEMBRA: '06:00', SIEMBRA: '08:30', RITUAL_GRATITUD: '06:15', COSECHA: '09:30' };
// Días después del paso anterior y fases a buscar (sigue los lineamientos del MSP).
const PLAN = [
  ['PREPARACION_TIERRA', 0, ['LUNA_NUEVA']],
  ['ESTRUCTURA_SIEMBRA', 15],
  ['RITUAL_SIEMBRA', 1, ['CRECIENTE', 'LLENA']],
  ['SIEMBRA', 0],
  ['SENALETICA', 2],
  ['CUIDADO_CRECIMIENTO', 10],
  ['RIEGO', 3],
  ['CUIDADO_CRECIMIENTO', 14],
  ['BANO_PREVIO_COSECHA', 18],
  ['RITUAL_GRATITUD', 2],
  ['COSECHA', 0],
  ['LIMPIEZA', 0],
  ['SECADO', 1],
  ['EMPAQUETADO', 12],
];

/**
 * Crea un ciclo con sus actividades hasta `hasta` pasos del PLAN. Las evidencias se aprueban y acreditan
 * puntos como lo haría el MSP, salvo las últimas `pendientes` (quedan por revisar) y, si se pide, una rechazada.
 */
async function ciclo({ huerto, responsableId, tecnicoId, planta, voluntarios, inicio, hasta = PLAN.length, pendientes = 0, rechazada = false, fallido = null }) {
  const c = await db.ciclo.create({ data: { huertoId: huerto.id, plantaId: planta.id, iniciadoEn: aFecha(inicio) } });
  let fecha = inicio;
  const pasos = PLAN.slice(0, hasta);
  for (const [i, [tipo, dias, fases]] of pasos.entries()) {
    fecha = sumar(fecha, dias);
    if (fases && tipo !== 'SIEMBRA') fecha = conFase(fecha, fases);
    if (fecha > hoy()) fecha = hoy();
    const detalle = tipo === 'SENALETICA' ? { ...DETALLE[tipo], color: planta.cualidad === 'CALIENTE' ? 'ROJO' : 'VERDE' } : { ...DETALLE[tipo] };
    if (tipo === 'EMPAQUETADO')
      Object.assign(detalle, {
        cantidad: 24,
        indicacionesUso: planta.usosMedicinales,
        dosificacion: planta.dosificacion,
        contraindicaciones: planta.contraindicaciones,
        fechaCaducidad: sumar(fecha, 300),
      });
    const ultimo = i >= pasos.length - pendientes;
    const esRechazada = rechazada && i === pasos.length - 1;
    const estado = esRechazada ? 'RECHAZADA' : ultimo ? 'PENDIENTE' : 'APROBADA';
    const participantes = Array.from({ length: 1 + (i % Math.min(3, voluntarios.length)) }, (_, k) => voluntarios[(i + k) % voluntarios.length]).map((v, k) => ({ voluntarioId: v.id, horas: [2, 1.5, 3, 1][(i + k) % 4] }));
    const a = await db.actividad.create({
      data: {
        huertoId: huerto.id,
        cicloId: c.id,
        registradaPorId: responsableId,
        tipo,
        fecha: aFecha(fecha),
        hora: HORA[tipo] ?? null,
        faseLunar: faseLunar(fecha),
        detalle,
        advertencias: [],
        estadoEvidencia: estado,
        motivoRechazo: esRechazada ? 'La foto no muestra el huerto registrado: se ve otro terreno. Sube una foto donde se vea la señalética del huerto.' : null,
        revisadaPorId: estado === 'PENDIENTE' ? null : tecnicoId,
        revisadaEn: estado === 'PENDIENTE' ? null : aFecha(sumar(fecha, 1)),
        participaciones: { create: participantes },
        archivos: { create: [fotoDemo(`${huerto.id.slice(0, 8)}-${c.id.slice(0, 6)}-${i}`, `${planta.nombreComun}: ${tipo.toLowerCase().replace(/_/g, ' ')}`, planta.cualidad === 'CALIENTE' ? '#b5523b' : '#3f7d3a')] },
      },
    });
    if (tipo === 'EMPAQUETADO')
      await db.paquete.create({
        data: {
          actividadId: a.id,
          cantidad: detalle.cantidad,
          indicacionesUso: detalle.indicacionesUso,
          dosificacion: detalle.dosificacion,
          contraindicaciones: detalle.contraindicaciones,
          fechaEmpaquetado: aFecha(fecha),
          fechaCaducidad: aFecha(detalle.fechaCaducidad),
          cualidad: planta.cualidad,
        },
      });
    if (estado === 'APROBADA') {
      let total = 0;
      for (const p of participantes) {
        const puntos = puntosParticipacion(p.horas, 1, true);
        total += puntos;
        await db.movimientoPuntos.create({ data: { voluntarioId: p.voluntarioId, huertoId: huerto.id, actividadId: a.id, puntos, horas: p.horas, creadoEn: aFecha(sumar(fecha, 1)) } });
        await db.voluntario.update({ where: { id: p.voluntarioId }, data: { puntos: { increment: puntos }, horasValidadas: { increment: p.horas } } });
      }
      await db.actividad.update({ where: { id: a.id }, data: { puntosOtorgados: total } });
      await db.huerto.update({ where: { id: huerto.id }, data: { puntosTotales: { increment: total }, ultimoCambioPuntos: aFecha(sumar(fecha, 1)) } });
    }
  }
  const tipos = pasos.map((p) => p[0]);
  if (fallido) await db.ciclo.update({ where: { id: c.id }, data: { estado: 'FALLIDO', causaFracaso: fallido.causa, justificacion: fallido.justificacion, cerradoEn: aFecha(fecha) } });
  else if (!estadoPasos(tipos).siguiente) await db.ciclo.update({ where: { id: c.id }, data: { estado: 'COMPLETADO', cerradoEn: aFecha(fecha) } });
  return c;
}

/** Recalcula el nivel de cada voluntario con las mismas reglas que el sistema. */
async function niveles() {
  for (const v of await db.voluntario.findMany()) {
    const ps = await db.participacion.findMany({
      where: { voluntarioId: v.id, actividad: { estadoEvidencia: 'APROBADA', cumplida: true } },
      select: { horas: true, actividad: { select: { tipo: true, cicloId: true, ciclo: { select: { estado: true } } } } },
    });
    const avance = {
      horas: ps.reduce((s, p) => s + Number(p.horas), 0),
      tipos: new Set(ps.map((p) => p.actividad.tipo)).size,
      ciclos: new Set(ps.filter((p) => p.actividad.ciclo.estado === 'COMPLETADO').map((p) => p.actividad.cicloId)).size,
    };
    const nivel = nivelPorAvance(avance, v.nivel);
    if (nivel !== v.nivel) await db.voluntario.update({ where: { id: v.id }, data: { nivel } });
  }
}

const NOMBRES = [
  ['María Quishpe', 'FEMENINO'], ['Luis Tituaña', 'MASCULINO'], ['Rosa Cachimuel', 'FEMENINO'], ['José Guamán', 'MASCULINO'],
  ['Carmen Yupanqui', 'FEMENINO'], ['Pedro Lema', 'MASCULINO'], ['Ana Chicaiza', 'FEMENINO'], ['Manuel Pilco', 'MASCULINO'],
  ['Lucía Andrango', 'FEMENINO'], ['Diego Sarango', 'MASCULINO'], ['Elena Tenesaca', 'FEMENINO'], ['Jorge Shiguango', 'MASCULINO'],
  ['Martha Grefa', 'FEMENINO'], ['Andrés Morocho', 'MASCULINO'], ['Sisa Pacari', 'FEMENINO'], ['Kléber Cuji', 'MASCULINO'],
  ['Inés Tapuy', 'FEMENINO'], ['Wilson Aules', 'MASCULINO'], ['Nina Farinango', 'FEMENINO'], ['Raúl Zhunio', 'MASCULINO'],
  ['Gloria Simbaña', 'FEMENINO'], ['Fausto Caiza', 'MASCULINO'], ['Mercedes Alvarado', 'FEMENINO'], ['Tupak Amaguaña', 'OTRO'],
];

async function main() {
  for (const [id, nombre, region, cabecera] of PROVINCIAS) {
    await db.provincia.upsert({ where: { id }, update: { nombre, region }, create: { id, nombre, region } });
    for (const p of [cabecera, ...(EXTRA[id] ?? [])]) {
      const pid = parroquiaId(id, p);
      await db.parroquia.upsert({ where: { id: pid }, update: { nombre: p }, create: { id: pid, nombre: p, provinciaId: id } });
    }
  }
  for (const p of PLANTAS) {
    const { nombreCientifico, ...datos } = p;
    await db.planta.upsert({ where: { nombreCientifico }, update: datos, create: p });
  }

  const password = process.env.DEMO_PASSWORD;
  if (!password || (await db.usuario.count())) return;
  const passwordHash = await hash(password, 10);
  const cuenta = (email, nombre, rol, extra = {}) =>
    db.usuario.create({ data: { email, nombre, rol, passwordHash, consentimientoDatosEn: new Date(), versionPolitica: '2026-11-09', ...extra } });

  await cuenta(process.env.ADMIN_EMAIL ?? 'admin@nexo.test', 'Administración Nexo', 'ADMIN');
  const tecnico = await cuenta(process.env.TECNICO_EMAIL ?? 'tecnico@nexo.test', 'Ing. Sandra Técnica MSP', 'TECNICO_MSP');
  const planta = Object.fromEntries((await db.planta.findMany()).map((p) => [p.nombreComun, p]));

  const HUERTOS = [
    { email: process.env.DEMO_EMAIL ?? 'demo@nexo.test', responsable: 'Rosa Demo Andrango', cedula: '1710034065', nombre: 'Huerto Sumak Kawsay', tipo: 'EN_TIERRA', subtipos: ['SURCO', 'CAMELLON'], prov: 17, parr: 'Conocoto', lat: -0.2906, lng: -78.4812, alt: 2550, vols: 6, plantas: ['Manzanilla', 'Toronjil', 'Ruda', 'Llantén', 'Matico'], suelo: 'MARGOSO', agua: 'CANAL', abono: 'COMPOST', cerca: 'VIVA', area: 120 },
    { email: 'otavalo@nexo.test', responsable: 'Luis Cachiguango', cedula: '1002003000', nombre: 'Jardín Mama Kuri', tipo: 'EN_TIERRA', subtipos: ['TERRAZA'], prov: 10, parr: 'Otavalo', lat: 0.2343, lng: -78.2611, alt: 2560, vols: 8, plantas: ['Ortiga', 'Malva', 'Manzanilla', 'Borraja'], suelo: 'LIMOSO', agua: 'RIO', abono: 'RESTOS_VEGETALES', cerca: 'MATERIAL_NATURAL', area: 300 },
    { email: 'riobamba@nexo.test', responsable: 'Carmen Guamán', cedula: '0602003006', nombre: 'Huerto Comunitario Guamote', tipo: 'EN_TIERRA', subtipos: ['SURCO'], prov: 6, parr: 'Guamote', lat: -1.9333, lng: -78.7167, alt: 3050, vols: 4, plantas: ['Valeriana', 'Diente de león', 'Llantén'], suelo: 'ARENOSO', agua: 'CANAL', abono: 'BARBECHO', cerca: 'VIVA', area: 200 },
    { email: 'cuenca@nexo.test', responsable: 'Diego Sarmiento', cedula: '0102003001', nombre: 'Balcón Medicinal El Vecino', tipo: 'EN_PISO', subtipos: ['MACETERO', 'BALCON', 'BOTELLA'], prov: 1, parr: 'Cuenca', lat: -2.9005, lng: -79.0045, alt: 2560, vols: 2, plantas: ['Cedrón', 'Menta', 'Caléndula'], suelo: 'MARGOSO', agua: 'OTRO', abono: 'COMPOST', area: 12 },
    { email: 'tena@nexo.test', responsable: 'Martha Grefa', cedula: '1502003005', nombre: 'Chakra Medicinal Wayusa', tipo: 'EN_TIERRA', subtipos: ['CAMADA'], prov: 15, parr: 'Tena', lat: -0.9938, lng: -77.8129, alt: 510, vols: 5, plantas: ['Guayusa', 'Uña de gato', 'Jengibre', 'Sangre de drago'], suelo: 'ARCILLOSO', agua: 'RIO', abono: 'HOJA', cerca: 'VIVA', area: 400 },
    { email: 'guayaquil@nexo.test', responsable: 'Andrés Morán', cedula: '0902003003', nombre: 'Muro Verde Sauces', tipo: 'VERTICAL', subtipos: ['PARED'], prov: 9, parr: 'Guayaquil', lat: -2.1167, lng: -79.9, alt: 8, vols: 3, plantas: ['Albahaca', 'Sábila', 'Hierba luisa'], suelo: 'MARGOSO', agua: 'GOTEO', abono: 'COMPOST', area: 15 },
    { email: 'loja@nexo.test', responsable: 'Elena Sarango', cedula: '1102003009', nombre: 'Huerto Colgante Saraguro', tipo: 'COLGANTE', subtipos: ['TECHO'], prov: 11, parr: 'Loja', lat: -3.9931, lng: -79.2042, alt: 2060, vols: 3, plantas: ['Orégano', 'Hierbabuena', 'Paico'], suelo: 'MARGOSO', agua: 'OTRO', abono: 'COMPOST', area: 10 },
    { email: 'ambato@nexo.test', responsable: 'Fausto Caiza', cedula: '1802003002', nombre: 'Terrazas de Pilahuín', tipo: 'EN_TIERRA', subtipos: ['TERRAZA', 'SURCO'], prov: 18, parr: 'Ambato', lat: -1.2491, lng: -78.6168, alt: 2580, vols: 4, plantas: ['Romero', 'Lavanda', 'Manzanilla'], suelo: 'GREDOSO', agua: 'CANAL', abono: 'COMPOST', cerca: 'METALICA', area: 180 },
  ];

  let n = 0;
  const huertos = [];
  for (const [i, h] of HUERTOS.entries()) {
    const resp = await cuenta(h.email, h.responsable, 'RESPONSABLE', { cedula: h.cedula, celular: `09${String(81234560 + i).padStart(8, '0')}` });
    const creado = new Date(Date.now() - (200 - i * 12) * DIA);
    const huerto = await db.huerto.create({
      data: {
        nombre: h.nombre, tipo: h.tipo, subtipos: h.subtipos, responsableId: resp.id, provinciaId: h.prov, parroquiaId: parroquiaId(h.prov, h.parr),
        latitud: h.lat, longitud: h.lng, altitud: h.alt, tipoSuelo: h.suelo, tipoAgua: h.agua, tipoAbono: h.abono, tipoCerca: h.cerca ?? null, areaM2: h.area, creadoEn: creado,
        historial: { create: { usuarioId: resp.id, desde: creado, motivo: 'Solicitud aprobada' } },
        plantas: { create: h.plantas.map((p) => ({ plantaId: planta[p].id, fueraDeAltitud: false })) },
      },
    });
    await db.solicitudHuerto.create({
      data: {
        nombreHuerto: h.nombre, tipo: h.tipo, subtipos: h.subtipos, provinciaId: h.prov, parroquiaId: parroquiaId(h.prov, h.parr), latitud: h.lat, longitud: h.lng, altitud: h.alt,
        nombreResponsable: h.responsable, cedula: h.cedula, email: h.email, celular: resp.celular, consentimientoDatosEn: creado, versionPolitica: '2026-11-09',
        estado: 'APROBADA', revisadaPorId: tecnico.id, revisadaEn: creado, huertoId: huerto.id, creadaEn: new Date(creado.getTime() - 3 * DIA),
      },
    });
    const vols = [];
    for (let k = 0; k < h.vols; k++) {
      const [nombre, genero] = NOMBRES[n++ % NOMBRES.length];
      vols.push(await db.voluntario.create({
        data: { nombre: k === 0 ? h.responsable : nombre, fechaNacimiento: aFecha(`${1960 + ((n * 7) % 45)}-0${1 + (n % 9)}-1${n % 9}`), genero: k === 0 ? 'PREFIERO_NO_DECIR' : genero, huertos: { create: { huertoId: huerto.id } } },
      }));
    }
    huertos.push({ huerto, resp, vols, h });
  }

  // Un voluntario que participa en dos huertos (vive en Quito y ayuda en Otavalo).
  await db.voluntarioHuerto.create({ data: { voluntarioId: huertos[0].vols[1].id, huertoId: huertos[1].huerto.id } });

  const base = (dias) => sumar(hoy(), -dias);
  const ctx = (i) => ({ huerto: huertos[i].huerto, responsableId: huertos[i].resp.id, tecnicoId: tecnico.id, voluntarios: huertos[i].vols });
  // Huerto demo: un ciclo completo (con producción), uno en crecimiento con evidencia pendiente,
  // uno con evidencia rechazada (para mostrar la segunda oportunidad) y uno fallido por helada.
  await ciclo({ ...ctx(0), planta: planta.Manzanilla, inicio: base(150) });
  await ciclo({ ...ctx(0), planta: planta.Toronjil, inicio: base(60), hasta: 7, pendientes: 1 });
  await ciclo({ ...ctx(0), planta: planta.Ruda, inicio: base(45), hasta: 5, rechazada: true });
  await ciclo({ ...ctx(0), planta: planta['Llantén'], inicio: base(110), hasta: 6, fallido: { causa: 'HELADA', justificacion: 'Helada de la madrugada del mes pasado quemó las plántulas.' } });
  // Otros huertos, con distinto avance para que el ranking y las estadísticas tengan datos.
  await ciclo({ ...ctx(1), planta: planta.Ortiga, inicio: base(170) });
  await ciclo({ ...ctx(1), planta: planta.Malva, inicio: base(140) });
  await ciclo({ ...ctx(1), planta: planta.Manzanilla, inicio: base(40), hasta: 6, pendientes: 1 });
  await ciclo({ ...ctx(2), planta: planta.Valeriana, inicio: base(90), hasta: 9 });
  await ciclo({ ...ctx(3), planta: planta['Cedrón'], inicio: base(70), hasta: 8, pendientes: 1 });
  await ciclo({ ...ctx(4), planta: planta.Guayusa, inicio: base(160) });
  await ciclo({ ...ctx(4), planta: planta.Jengibre, inicio: base(50), hasta: 7 });
  await ciclo({ ...ctx(5), planta: planta.Albahaca, inicio: base(80), hasta: 10 });
  await ciclo({ ...ctx(6), planta: planta['Orégano'], inicio: base(30), hasta: 4, pendientes: 1 });
  await ciclo({ ...ctx(7), planta: planta.Romero, inicio: base(130) });
  await niveles();

  // Solicitudes que esperan al técnico del MSP.
  const pendientes = [
    { nombreHuerto: 'Huerto Escolar Cotacachi', tipo: 'EN_TIERRA', subtipos: ['SURCO'], provinciaId: 10, parroquiaId: parroquiaId(10, 'Cotacachi'), latitud: 0.3011, longitud: -78.2647, altitud: 2420, nombreResponsable: 'Sisa Perugachi', cedula: '1003004007', email: 'sisa.perugachi@nexo.test', celular: '0987654321' },
    { nombreHuerto: 'Terraza Medicinal Cumbayá', tipo: 'EN_PISO', subtipos: ['MACETERO', 'TERRAZA_PISO'], provinciaId: 17, parroquiaId: parroquiaId(17, 'Cumbayá'), latitud: -0.2027, longitud: -78.4337, altitud: 2340, nombreResponsable: 'Jorge Benítez', cedula: '1704005006', email: 'jorge.benitez@nexo.test', celular: '0998877665' },
    { nombreHuerto: 'Huerto de las Abuelas de Paute', tipo: 'EN_TIERRA', subtipos: ['CAMELLON', 'CAMADA'], provinciaId: 1, parroquiaId: parroquiaId(1, 'Paute'), latitud: -2.7769, longitud: -78.7586, altitud: 2290, nombreResponsable: 'Mercedes Tenesaca', cedula: '0104005004', email: 'mercedes.tenesaca@nexo.test', celular: '0976655443' },
  ];
  for (const [i, s] of pendientes.entries())
    await db.solicitudHuerto.create({ data: { ...s, consentimientoDatosEn: new Date(), versionPolitica: '2026-11-09', creadaEn: new Date(Date.now() - (i + 1) * DIA) } });
  await db.solicitudHuerto.create({
    data: {
      ...pendientes[0], nombreHuerto: 'Huerto en lote baldío', cedula: '1712345675', email: 'lote@nexo.test', estado: 'RECHAZADA',
      motivo: 'El terreno es municipal y no hay permiso de uso. Pueden volver a solicitar con la autorización del GAD.',
      revisadaPorId: tecnico.id, revisadaEn: new Date(Date.now() - 10 * DIA), consentimientoDatosEn: new Date(), versionPolitica: '2026-11-09',
    },
  });

  // Planta propuesta por el huerto demo y voluntario con experiencia que pide entrar como Oficial.
  await db.planta.create({
    data: {
      nombreComun: 'Chilca', nombreCientifico: 'Baccharis latifolia', familiaBotanica: 'Asteraceae', altitudMin: 2000, altitudMax: 3800, provincias: ['Pichincha', 'Imbabura'],
      ciclo: 'LARGO', cualidad: 'CALIENTE', usosMedicinales: 'Inflamación y dolores de huesos en emplastos; baños para el frío.', estado: 'PENDIENTE', propuestaPorId: huertos[0].huerto.id,
    },
  });
  const experto = await db.voluntario.create({
    data: { nombre: 'Taita Segundo Maldonado', cedula: '1706007000', fechaNacimiento: aFecha('1952-04-12'), genero: 'MASCULINO', huertos: { create: { huertoId: huertos[0].huerto.id } } },
  });
  await db.solicitudNivel.create({
    data: { voluntarioId: experto.id, huertoId: huertos[0].huerto.id, nivel: 'MAESTRO', justificacion: 'Yachak de la comunidad, guía los rituales de siembra y cosecha desde hace más de 30 años y enseña a los jóvenes el uso de las plantas.' },
  });

  // Bodega del huerto demo.
  const bodega = [
    ['HERRAMIENTAS', 'Azadón', 3, 'unidades'], ['HERRAMIENTAS', 'Pala', 2, 'unidades'], ['HERRAMIENTAS', 'Rastrillo', 2, 'unidades'], ['HERRAMIENTAS', 'Regadera de aluminio', 4, 'unidades'],
    ['SEMILLAS_PLANTULAS', 'Plántulas de toronjil', 30, 'plántulas'], ['SEMILLAS_PLANTULAS', 'Estacas de ruda', 15, 'estacas'], ['SEMILLAS_PLANTULAS', 'Semillas de manzanilla', 200, 'gramos'],
    ['ABONOS', 'Compost', 80, 'kg'], ['ABONOS', 'Ceniza de fogón', 5, 'kg'],
  ];
  for (const [espacio, nombre, cantidad, unidad] of bodega) await db.bodegaItem.create({ data: { huertoId: huertos[0].huerto.id, espacio, nombre, cantidad, unidad } });

  // Foro.
  const [demo, otavalo, tena] = [huertos[0].resp, huertos[1].resp, huertos[4].resp];
  const aporte = (autorId, categoria, titulo, contenido, extra = {}) => db.aporte.create({ data: { autorId, categoria, titulo, contenido, ...extra } });
  const a1 = await aporte(otavalo.id, 'SABERES', 'La ortiga y el chineado', 'En nuestra comunidad los abuelos chinean con ortiga fresca para la mala circulación y el frío en los huesos. Se cosecha en luna llena, con guantes, y se aplica en la piel con suavidad.');
  await aporte(demo.id, 'SABERES', null, 'Gracias por compartir. En Conocoto también la usamos, y la sembramos junto a la manzanilla porque se protegen entre sí.', { padreId: a1.id });
  await aporte(tecnico.id, 'SABERES', null, 'Buen aporte. Recordemos que la ortiga no se usa en el embarazo. Pueden ver su ficha en el catálogo.', { padreId: a1.id });
  await aporte(tena.id, 'PRACTICAS', 'Ritual de la guayusa al amanecer', 'Nos levantamos a las 4 de la mañana para tomar guayusa y conversar los sueños. Luego vamos a la chakra. Ese es el mejor momento para el ritual de siembra.');
  await aporte(demo.id, 'PRACTICAS', 'Secado a la sombra con papel periódico', 'Probamos secar la manzanilla en estantes con papel periódico y salió mejor que colgada: no pierde las flores. Tardó 12 días.');
  await aporte(otavalo.id, 'SENTIRES', 'Lo que sentimos al cosechar', 'Cuando hacemos el ritual de gratitud antes de cosechar sentimos que la planta nos da permiso. Las personas mayores dicen que así cura mejor.');
  await aporte(tena.id, 'PRACTICAS', 'Vendo plantas a domicilio', 'Llámenme para comprar plantas medicinales a buen precio.', { reportes: 2 });

  console.log(`Datos demo cargados: ${HUERTOS.length} huertos, ${n} voluntarios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
