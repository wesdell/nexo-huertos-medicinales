import type { FaseLunar, TipoActividad } from './enums';

/**
 * Pasos de un ciclo de siembra y cosecha, en orden, según los lineamientos del MSP (2017)
 * «Implementación de huertos medicinales en los establecimientos de salud del primer nivel de atención».
 * Reunión MSP: las actividades se registran después de hacerlas; el sistema muestra el paso N+1
 * cuando se registra el paso N. Un paso saltado queda como no cumplido (0 puntos).
 */
export interface Paso {
  tipo: TipoActividad;
  orden: number;
  nombre: string;
  cuando: string;
  como: string[];
  /** Fases lunares recomendadas: seguirlas da el bono de saber ancestral. */
  fases?: FaseLunar[];
  /** Cuidado y riego se repiten mientras la planta crece (entre la siembra y el baño previo). */
  repetible?: boolean;
  etapa: 'PREPARACION' | 'SIEMBRA' | 'CRECIMIENTO' | 'COSECHA' | 'POSTCOSECHA';
}

export const PASOS: Paso[] = [
  {
    tipo: 'PREPARACION_TIERRA',
    orden: 1,
    nombre: 'Preparación de la tierra',
    etapa: 'PREPARACION',
    fases: ['LUNA_NUEVA'],
    cuando: 'En un día soleado y en fase de luna oscura (luna nueva), tiempo de descomposición que fertiliza la tierra.',
    como: [
      'Retira la maleza y esparce la maleza desmenuzada sobre el terreno.',
      'Si tienes, complementa con abono orgánico (compost, restos vegetales).',
      'Remueve la tierra con azadón o pala.',
      'Espera unos 15 días para que se dé el proceso de fertilización antes de sembrar.',
    ],
  },
  {
    tipo: 'ESTRUCTURA_SIEMBRA',
    orden: 2,
    nombre: 'Surcos, terrazas, camadas o camellones',
    etapa: 'PREPARACION',
    cuando: 'Después de los 15 días de fertilización de la tierra.',
    como: [
      'Elabora la estructura según el diseño del huerto: surcos (wachu), andenes o terrazas (anti), camellones (inka wachu) o camadas.',
      'En huertos verticales, colgantes o en piso, prepara maceteros, botellas o llantas con la tierra ya fertilizada.',
      'Orienta los surcos de Este a Oeste para aprovechar el sol de la mañana.',
    ],
  },
  {
    tipo: 'RITUAL_SIEMBRA',
    orden: 3,
    nombre: 'Ritual de siembra',
    etapa: 'SIEMBRA',
    fases: ['CRECIENTE', 'LLENA'],
    cuando: 'En luna creciente o luna llena, a la salida del sol.',
    como: [
      'Ceremonia de «pago a la tierra» para despertar, alimentar y fortalecer a la madre tierra.',
      'Bendice las semillas, estacas, esquejes y plántulas que se van a sembrar.',
      'La guían hombres y mujeres de sabiduría del lugar, con la participación de todas las personas del huerto.',
    ],
  },
  {
    tipo: 'SIEMBRA',
    orden: 4,
    nombre: 'Siembra',
    etapa: 'SIEMBRA',
    fases: ['CRECIENTE', 'LLENA'],
    cuando: 'Después del ritual, desde las 8 de la mañana, en luna creciente o luna llena.',
    como: [
      'Siembra con la técnica que corresponda: surcos, andenes o terrazas, camellones.',
      'Elige el tipo de siembra: semillas (de preferencia de la región), estacas, esquejes o plántulas.',
      'Las estacas van en un hoyo de unos 10 cm; riega con abundante agua justo después de sembrar.',
    ],
  },
  {
    tipo: 'SENALETICA',
    orden: 5,
    nombre: 'Colocación de señalética',
    etapa: 'SIEMBRA',
    cuando: 'Después de la siembra, en cada espacio o clase de planta.',
    como: [
      'Incluye el nombre en idioma local, el nombre común, el científico, la familia y el uso general.',
      'Usa color rojo si la planta es caliente y verde o blanco si es fría.',
    ],
  },
  {
    tipo: 'CUIDADO_CRECIMIENTO',
    orden: 6,
    nombre: 'Cuidados de crecimiento',
    etapa: 'CRECIMIENTO',
    repetible: true,
    cuando: 'Mientras la planta crece; repítelo cuantas veces haga falta.',
    como: [
      'Deshierbe, replante (repón las plantas que murieron) y aporque.',
      'En la Sierra se acostumbra poner ceniza de fogón alrededor de las plantas contra plagas.',
      'No se fumiga con ningún producto: los cultivos asociados protegen a las plantas.',
    ],
  },
  {
    tipo: 'RIEGO',
    orden: 7,
    nombre: 'Riego',
    etapa: 'CRECIMIENTO',
    repetible: true,
    cuando: 'Temprano en la mañana o al atardecer, durante el crecimiento.',
    como: [
      'Con agua de riego por los surcos, manguera o regadera de aluminio.',
      'Con manguera, apóyala en el suelo: no uses aspersor ni chorros a manera de lluvia, que violentan a la planta.',
    ],
  },
  {
    tipo: 'BANO_PREVIO_COSECHA',
    orden: 8,
    nombre: 'Baño previo a la cosecha',
    etapa: 'COSECHA',
    cuando: 'Dos días antes de la cosecha. Ciclo corto: unas 6 a 8 semanas después de la siembra; ciclo largo: cuando la planta madura.',
    como: [
      'Baña las plantas con agua: las plantas que se secan y empaquetan no se lavan después de cosecharlas.',
    ],
  },
  {
    tipo: 'RITUAL_GRATITUD',
    orden: 9,
    nombre: 'Ritual de gratitud',
    etapa: 'COSECHA',
    cuando: 'Al amanecer del día de la cosecha.',
    como: ['Agradece a la madre tierra y a las plantas por su poder sanador antes de cosechar.'],
  },
  {
    tipo: 'COSECHA',
    orden: 10,
    nombre: 'Cosecha',
    etapa: 'COSECHA',
    fases: ['CRECIENTE', 'LLENA', 'MENGUANTE'],
    cuando:
      'Cuando el sol calentó y se secó el rocío. Hojas, flores y frutos: luna creciente o llena. Semillas o raíces: cuarto menguante.',
    como: ['Las plantas medicinales no se cosechan con humedad.', 'Cosecha solo las partes que se van a usar.'],
  },
  {
    tipo: 'LIMPIEZA',
    orden: 11,
    nombre: 'Limpieza',
    etapa: 'POSTCOSECHA',
    cuando: 'Inmediatamente después de la cosecha.',
    como: [
      'Limpieza manual y exhaustiva: escoge las partes a usar (planta entera, hojas, tallos, raíces, flores, frutos).',
      'No laves las plantas después de cosecharlas: se pudren y pierden su espíritu sanador.',
    ],
  },
  {
    tipo: 'SECADO',
    orden: 12,
    nombre: 'Secado',
    etapa: 'POSTCOSECHA',
    cuando: 'De 10 a 15 días, siempre a la sombra.',
    como: [
      'Hojas, raíces y flores: sobre papel periódico en un estante, bajo sombra.',
      'Plantas completas: colgadas con la raíz hacia arriba, en un espacio techado, sin sol directo y con circulación de aire.',
      'Lejos de animales, cuyeras, corrales o establos.',
    ],
  },
  {
    tipo: 'EMPAQUETADO',
    orden: 13,
    nombre: 'Empaquetado, etiquetado y almacenaje',
    etapa: 'POSTCOSECHA',
    cuando: 'Cuando la planta está completamente seca.',
    como: [
      'Etiqueta con nombre, indicaciones de uso, dosificación, contraindicaciones, fecha de empaquetado, caducidad y cualidad caliente o fría.',
      'En la Sierra, las plantas secas se guardan en fundas cerradas herméticamente hasta 12 meses, en un lugar fresco y seco.',
    ],
  },
];

export const PASO_POR_TIPO = Object.fromEntries(PASOS.map((p) => [p.tipo, p])) as Record<TipoActividad, Paso>;
export const NOMBRE_ACTIVIDAD = Object.fromEntries(PASOS.map((p) => [p.tipo, p.nombre])) as Record<TipoActividad, string>;

export interface EstadoPasos {
  /** Próximo paso obligatorio, o null si el ciclo ya terminó. */
  siguiente: Paso | null;
  /** Pasos repetibles disponibles ahora (cuidado y riego, entre la siembra y el baño). */
  repetibles: Paso[];
  /** Pasos ya registrados (cumplidos o no). */
  hechos: TipoActividad[];
}

/**
 * Qué se puede registrar en un ciclo según lo ya registrado (cumplido o no cumplido).
 * Cuidado y riego se pueden registrar varias veces desde la siembra hasta el baño previo a la cosecha.
 */
export function estadoPasos(registrados: TipoActividad[]): EstadoPasos {
  const hechos = [...new Set(registrados)];
  const maxOrden = Math.max(0, ...hechos.map((t) => PASO_POR_TIPO[t].orden));
  const siguiente = PASOS.find((p) => p.orden > maxOrden && !hechos.includes(p.tipo)) ?? null;
  const sembrado = hechos.includes('SIEMBRA');
  const banado = maxOrden >= PASO_POR_TIPO.BANO_PREVIO_COSECHA.orden;
  const repetibles = sembrado && !banado ? PASOS.filter((p) => p.repetible && hechos.includes(p.tipo)) : [];
  return { siguiente, repetibles, hechos };
}

/** ¿Se puede registrar este tipo ahora? Solo el siguiente paso o un repetible ya iniciado. */
export function puedeRegistrar(tipo: TipoActividad, registrados: TipoActividad[]) {
  const e = estadoPasos(registrados);
  return e.siguiente?.tipo === tipo || e.repetibles.some((p) => p.tipo === tipo);
}

/** El ciclo termina con el empaquetado (cumplido o no). */
export const cicloTerminado = (registrados: TipoActividad[]) => registrados.includes('EMPAQUETADO');
