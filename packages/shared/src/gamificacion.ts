import type { NivelMiembro, TipoActividad } from './enums';

// Propuestas del equipo para los pendientes de la reunión con el MSP (06/11/2026).

// ─────────────── Puntos ───────────────
/** Reunión MSP: 1 hora trabajada = 1 unidad, sin importar el tipo de trabajo. Se muestran 10 puntos por hora. */
export const PUNTOS_POR_HORA = 10;
/** Bono de saber ancestral: +10 % si la actividad siguió el calendario (sin advertencias). */
export const BONO_SABER = 0.1;
/** Factor por intento de evidencia: 1.º completo, 2.º la mitad, 3.º ya no hay puntos (el huerto sigue). */
export const FACTOR_INTENTO = [1, 0.5] as const;
export const MAX_INTENTOS = FACTOR_INTENTO.length;

/**
 * Puntos de un voluntario por una actividad cuya evidencia aprobó el MSP.
 * Paso no cumplido (saltado) o intento fuera de rango: 0.
 */
export function puntosParticipacion(horas: number, intento: number, conBono: boolean, cumplida = true) {
  const factor = FACTOR_INTENTO[intento - 1];
  if (!cumplida || factor === undefined || horas <= 0) return 0;
  return Math.round(horas * PUNTOS_POR_HORA * factor * (conBono ? 1 + BONO_SABER : 1));
}

// ─────────────── Niveles ───────────────
export interface Avance {
  /** Horas con evidencia aprobada. */
  horas: number;
  /** Tipos de actividad distintos con evidencia aprobada. */
  tipos: number;
  /** Ciclos completados (hasta el empaquetado) en los que participó. */
  ciclos: number;
}

export const REQUISITOS_NIVEL: Record<Exclude<NivelMiembro, 'APRENDIZ'>, Avance> = {
  OFICIAL: { horas: 40, tipos: 4, ciclos: 0 },
  MAESTRO: { horas: 150, tipos: 8, ciclos: 1 },
};
const ORDEN_NIVEL: NivelMiembro[] = ['APRENDIZ', 'OFICIAL', 'MAESTRO'];
const cumple = (a: Avance, r: Avance) => a.horas >= r.horas && a.tipos >= r.tipos && a.ciclos >= r.ciclos;

/** Reunión MSP: el ascenso es automático y nunca se baja de nivel. */
export function nivelPorAvance(a: Avance, actual: NivelMiembro = 'APRENDIZ'): NivelMiembro {
  const ganado: NivelMiembro = cumple(a, REQUISITOS_NIVEL.MAESTRO) ? 'MAESTRO' : cumple(a, REQUISITOS_NIVEL.OFICIAL) ? 'OFICIAL' : 'APRENDIZ';
  return ORDEN_NIVEL.indexOf(ganado) > ORDEN_NIVEL.indexOf(actual) ? ganado : actual;
}

/** Qué le falta para el siguiente nivel, para mostrarlo como meta. */
export function siguienteNivel(a: Avance, actual: NivelMiembro) {
  if (actual === 'MAESTRO') return null;
  const nivel = actual === 'APRENDIZ' ? 'OFICIAL' : 'MAESTRO';
  const r = REQUISITOS_NIVEL[nivel];
  return {
    nivel,
    faltan: { horas: Math.max(0, r.horas - a.horas), tipos: Math.max(0, r.tipos - a.tipos), ciclos: Math.max(0, r.ciclos - a.ciclos) },
    progreso: Math.min(100, Math.round(((Math.min(a.horas / r.horas, 1) + Math.min(a.tipos / r.tipos, 1) + (r.ciclos ? Math.min(a.ciclos / r.ciclos, 1) : 1)) / 3) * 100)),
  };
}

// ─────────────── Talentos certificados ───────────────
/** Un talento se certifica con 3 participaciones aprobadas en sus actividades. */
export const PARTICIPACIONES_TALENTO = 3;
export const TALENTOS: { codigo: string; nombre: string; tipos: TipoActividad[] }[] = [
  { codigo: 'PREPARADOR', nombre: 'Preparación de la tierra', tipos: ['PREPARACION_TIERRA', 'ESTRUCTURA_SIEMBRA'] },
  { codigo: 'RITUALISTA', nombre: 'Rituales ancestrales', tipos: ['RITUAL_SIEMBRA', 'RITUAL_GRATITUD'] },
  { codigo: 'SEMBRADOR', nombre: 'Siembra', tipos: ['SIEMBRA', 'SENALETICA'] },
  { codigo: 'CUIDADOR', nombre: 'Cuidado y riego', tipos: ['CUIDADO_CRECIMIENTO', 'RIEGO'] },
  { codigo: 'COSECHADOR', nombre: 'Cosecha', tipos: ['BANO_PREVIO_COSECHA', 'COSECHA', 'LIMPIEZA'] },
  { codigo: 'HERBOLARIO', nombre: 'Secado y empaquetado', tipos: ['SECADO', 'EMPAQUETADO'] },
];

export function talentosCertificados(participacionesPorTipo: Partial<Record<TipoActividad, number>>) {
  return TALENTOS.filter((t) => t.tipos.reduce((s, tipo) => s + (participacionesPorTipo[tipo] ?? 0), 0) >= PARTICIPACIONES_TALENTO);
}

// ─────────────── Ranking ───────────────
/**
 * Reunión MSP: rankings por tipo de huerto, normalizados por número de voluntarios.
 * Índice = puntos de los últimos 12 meses ÷ √(voluntarios activos + 1).
 * La raíz evita que un huerto de una persona gane solo por dividir entre 1, sin castigar a los grupos grandes.
 */
export const indiceRanking = (puntos: number, voluntarios: number) => Math.round((puntos / Math.sqrt(Math.max(0, voluntarios) + 1)) * 10) / 10;

export interface FilaRanking {
  id: string;
  puntos: number;
  voluntarios: number;
  /** Desempate: quien llegó primero a su puntaje. */
  ultimoCambio: string | null;
}

export function ordenarRanking<T extends FilaRanking>(filas: T[]) {
  return filas
    .map((f) => ({ ...f, indice: indiceRanking(f.puntos, f.voluntarios) }))
    .sort((a, b) => b.indice - a.indice || (a.ultimoCambio ?? '9').localeCompare(b.ultimoCambio ?? '9'))
    .map((f, i) => ({ ...f, posicion: i + 1 }));
}

// ─────────────── Misiones e insignias del huerto ───────────────
export interface EstadisticasHuerto {
  siembras: number;
  ciclosCompletos: number;
  /** Ciclos completos en los que todos los pasos con fase recomendada la siguieron. */
  ciclosLunaPerfecta: number;
  secados: number;
  paquetes: number;
  plantasDistintas: number;
  voluntariosActivos: number;
  evidenciasAprobadas: number;
  rituales: number;
}

export interface Mision {
  codigo: string;
  nombre: string;
  insignia: string;
  descripcion: string;
  meta: number;
  medida: keyof EstadisticasHuerto;
}

/** Misiones del huerto: al cumplir la meta se gana la insignia. Se calculan con los datos, no se guardan. */
export const MISIONES: Mision[] = [
  { codigo: 'PRIMERA_SIEMBRA', nombre: 'Primera siembra', insignia: 'Semilla despierta', descripcion: 'Registra la primera siembra del huerto.', meta: 1, medida: 'siembras' },
  { codigo: 'GUARDIAN_SEMILLA', nombre: 'Guardián de la semilla', insignia: 'Guardián de la semilla', descripcion: 'Registra 5 siembras en el huerto.', meta: 5, medida: 'siembras' },
  { codigo: 'HUERTO_DIVERSO', nombre: 'Huerto diverso', insignia: 'Chakra diversa', descripcion: 'Cultiva 5 plantas medicinales distintas.', meta: 5, medida: 'plantasDistintas' },
  { codigo: 'MINKA', nombre: 'Minka', insignia: 'Manos unidas', descripcion: 'Suma 5 voluntarios activos al huerto.', meta: 5, medida: 'voluntariosActivos' },
  { codigo: 'SABER_RITUAL', nombre: 'Saber ritual', insignia: 'Pago a la tierra', descripcion: 'Realiza 3 rituales de siembra o de gratitud.', meta: 3, medida: 'rituales' },
  { codigo: 'EVIDENCIA_CLARA', nombre: 'Evidencia clara', insignia: 'Ojo del huerto', descripcion: 'Logra 10 evidencias aprobadas por el MSP.', meta: 10, medida: 'evidenciasAprobadas' },
  { codigo: 'SUPERAR_SECADO', nombre: 'Superar el secado', insignia: 'Sombra sabia', descripcion: 'Completa un secado de plantas a la sombra.', meta: 1, medida: 'secados' },
  { codigo: 'CICLO_COMPLETO', nombre: 'Ciclo completo', insignia: 'Ciclo de vida', descripcion: 'Completa un ciclo desde la preparación hasta el empaquetado.', meta: 1, medida: 'ciclosCompletos' },
  { codigo: 'CICLO_LUNAR_PERFECTO', nombre: 'Ciclo lunar perfecto', insignia: 'Hija e hijo de la luna', descripcion: 'Completa un ciclo siguiendo todas las fases lunares recomendadas.', meta: 1, medida: 'ciclosLunaPerfecta' },
  { codigo: 'BOTICA_COMUNITARIA', nombre: 'Botica comunitaria', insignia: 'Botica comunitaria', descripcion: 'Entrega 20 paquetes de plantas secas.', meta: 20, medida: 'paquetes' },
];

export function misiones(e: EstadisticasHuerto) {
  return MISIONES.map((m) => ({ ...m, actual: Math.min(e[m.medida], m.meta), cumplida: e[m.medida] >= m.meta }));
}
