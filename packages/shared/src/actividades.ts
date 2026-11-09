import type { CualidadPlanta, FaseLunar, TipoActividad } from './enums';
import { faseLunar, NOMBRE_FASE } from './lunar';
import { PASO_POR_TIPO } from './pasos';

export const ESTRUCTURAS = { SURCOS: 'Surcos', TERRAZAS: 'Andenes o terrazas', CAMELLONES: 'Camellones', CAMADAS: 'Camadas', RECIPIENTES: 'Maceteros, botellas o llantas' } as const;
export const TECNICAS_SIEMBRA = { SURCOS: 'Surcos', TERRAZAS: 'Andenes o terrazas', CAMELLONES: 'Camellones', RECIPIENTES: 'Maceteros o recipientes' } as const;
export const TIPOS_SIEMBRA = { SEMILLAS: 'Semillas', ESTACAS: 'Estacas', ESQUEJES: 'Esquejes', PLANTULAS: 'Plántulas' } as const;
// El aspersor no se usa (lineamientos MSP), por eso no existe como opción.
export const METODOS_RIEGO = { AGUA_RIEGO: 'Agua de riego por surcos', MANGUERA: 'Manguera apoyada en el suelo', REGADERA: 'Regadera de aluminio' } as const;
export const PARTES_COSECHA = { HOJAS: 'Hojas', FLORES: 'Flores', FRUTOS: 'Frutos', SEMILLAS: 'Semillas', RAICES: 'Raíces', PLANTA_ENTERA: 'Planta entera' } as const;
export const LABORES_CUIDADO = { DESHIERBE: 'Deshierbe', REPLANTE: 'Replante', APORQUE: 'Aporque', CENIZA: 'Ceniza de fogón contra plagas' } as const;
export const COLORES_SENALETICA = { ROJO: 'Rojo (planta caliente)', VERDE: 'Verde (planta fría)', BLANCO: 'Blanco (planta fría)' } as const;
export const LUGARES_SECADO = { ESTANTE_SOMBRA: 'Estante con papel periódico, a la sombra', COLGADO_SOMBRA: 'Colgadas boca abajo, a la sombra', SOL: 'Al sol' } as const;

/** Reunión MSP: validación mínima, nadie trabaja más de 24 horas en un día. */
export const MAX_HORAS_DIA = 24;
/** Caducidad máxima de una planta seca empaquetada (lineamientos MSP: 12 meses en la Sierra). */
export const MESES_CADUCIDAD_MAX = 12;

export interface Participacion {
  voluntarioId: string;
  horas: number;
}

export interface EntradaActividad {
  tipo: string;
  fecha?: string; // AAAA-MM-DD
  hora?: string; // HH:mm
  participantes?: Participacion[];
  detalle?: Record<string, unknown>;
}

/** Datos que el servidor lee antes de validar. */
export interface ContextoActividad {
  hoy: string; // AAAA-MM-DD, para rechazar fechas futuras
  cualidad: CualidadPlanta;
  /** Voluntarios activos del huerto. */
  voluntarios: string[];
  /** Horas que cada voluntario ya tiene registradas en esa fecha (en cualquier huerto). */
  horasDelDia: Record<string, number>;
  /** Fecha del paso anterior del ciclo, para no registrar pasos antes de él. */
  fechaPasoAnterior?: string;
  /** Fecha del baño previo, para comparar con la cosecha (2 días antes). */
  fechaBano?: string;
}

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}
export type CodigoAdvertencia = 'FASE_LUNAR' | 'ROCIO' | 'AMANECER' | 'HORA_SIEMBRA' | 'BANO' | 'DIAS_SECADO' | 'FERTILIZACION';
export interface Advertencia {
  codigo: CodigoAdvertencia;
  mensaje: string;
}
export interface ResultadoValidacion {
  errores: ErrorCampo[];
  advertencias: Advertencia[];
  faseLunar: FaseLunar | null;
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const esUna = (obj: object, v: unknown) => typeof v === 'string' && Object.hasOwn(obj, v);
const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const diasEntre = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

function advertenciaFase(fase: FaseLunar | null, recomendadas: FaseLunar[], que: string): Advertencia[] {
  if (!fase || recomendadas.includes(fase)) return [];
  const nombres = recomendadas.map((f) => NOMBRE_FASE[f].toLowerCase()).join(' o ');
  return [{ codigo: 'FASE_LUNAR', mensaje: `Para ${que} se recomienda ${nombres}; en esa fecha hay ${NOMBRE_FASE[fase].toLowerCase()}.` }];
}

const amanecer = (hora: string | undefined, que: string): Advertencia[] =>
  hora && HORA.test(hora) && (hora < '05:30' || hora > '07:30')
    ? [{ codigo: 'AMANECER', mensaje: `El ${que} se recomienda a la salida del sol (entre las 5:30 y las 7:30).` }]
    : [];

/** Errores de los participantes: al menos uno, del huerto, con horas válidas y sin pasar de 24 h en el día. */
export function validarParticipantes(ps: Participacion[] | undefined, ctx: Pick<ContextoActividad, 'voluntarios' | 'horasDelDia'>): ErrorCampo[] {
  if (!ps?.length) return [{ campo: 'participantes', mensaje: 'Indica quién participó y cuántas horas.' }];
  const vistos = new Set<string>();
  for (const p of ps) {
    if (!ctx.voluntarios.includes(p.voluntarioId))
      return [{ campo: 'participantes', mensaje: 'Solo pueden participar voluntarios activos del huerto.' }];
    if (vistos.has(p.voluntarioId)) return [{ campo: 'participantes', mensaje: 'Cada voluntario aparece una sola vez.' }];
    vistos.add(p.voluntarioId);
    if (typeof p.horas !== 'number' || !Number.isFinite(p.horas) || p.horas <= 0)
      return [{ campo: 'participantes', mensaje: 'Las horas deben ser mayores que 0.' }];
    if (Math.round(p.horas * 2) !== p.horas * 2) return [{ campo: 'participantes', mensaje: 'Usa horas enteras o medias horas (por ejemplo 1,5).' }];
    if ((ctx.horasDelDia[p.voluntarioId] ?? 0) + p.horas > MAX_HORAS_DIA)
      return [{ campo: 'participantes', mensaje: `Un voluntario no puede sumar más de ${MAX_HORAS_DIA} horas en un día.` }];
  }
  return [];
}

/**
 * Valida una actividad de cualquiera de los 13 pasos.
 * Los errores bloquean el guardado; las advertencias se confirman («guardar de todas formas») y quitan el bono.
 * El orden de los pasos lo controla `puedeRegistrar` (pasos.ts).
 */
export function validarActividad(e: EntradaActividad, ctx: ContextoActividad): ResultadoValidacion {
  const errores: ErrorCampo[] = [];
  const adv: Advertencia[] = [];
  const d = e.detalle ?? {};

  if (!Object.hasOwn(PASO_POR_TIPO, e.tipo))
    return { errores: [{ campo: 'tipo', mensaje: 'Elige un tipo de actividad válido.' }], advertencias: [], faseLunar: null };
  const tipo = e.tipo as TipoActividad;
  const paso = PASO_POR_TIPO[tipo];

  const fase = e.fecha ? faseLunar(e.fecha) : null;
  if (!e.fecha) errores.push({ campo: 'fecha', mensaje: 'Indica la fecha.' });
  else if (!fase) errores.push({ campo: 'fecha', mensaje: 'La fecha no es válida.' });
  else if (e.fecha > ctx.hoy) errores.push({ campo: 'fecha', mensaje: 'La fecha no puede ser futura: registra lo que ya hiciste.' });
  else if (ctx.fechaPasoAnterior && e.fecha < ctx.fechaPasoAnterior)
    errores.push({ campo: 'fecha', mensaje: 'La fecha no puede ser anterior a la del paso previo del ciclo.' });
  if (e.hora && !HORA.test(e.hora)) errores.push({ campo: 'hora', mensaje: 'Usa el formato HH:mm.' });
  const conHora: TipoActividad[] = ['RITUAL_SIEMBRA', 'SIEMBRA', 'RITUAL_GRATITUD', 'COSECHA'];
  if (conHora.includes(tipo) && !e.hora) errores.push({ campo: 'hora', mensaje: 'Indica la hora.' });

  errores.push(...validarParticipantes(e.participantes, ctx));

  switch (tipo) {
    case 'PREPARACION_TIERRA':
      for (const [campo, nombre] of [
        ['retiroMaleza', 'el retiro de maleza'],
        ['esparcido', 'el esparcido de la maleza'],
        ['remocion', 'la remoción de la tierra'],
      ] as const) {
        if (d[campo] !== true) errores.push({ campo, mensaje: `Confirma ${nombre}.` });
      }
      break;
    case 'ESTRUCTURA_SIEMBRA':
      if (!esUna(ESTRUCTURAS, d.estructura)) errores.push({ campo: 'estructura', mensaje: 'Elige la estructura que elaboraste.' });
      if (ctx.fechaPasoAnterior && e.fecha && fase && diasEntre(ctx.fechaPasoAnterior, e.fecha) < 15)
        adv.push({ codigo: 'FERTILIZACION', mensaje: 'Se recomienda esperar 15 días después de preparar la tierra para que se fertilice.' });
      break;
    case 'RITUAL_SIEMBRA':
      adv.push(...amanecer(e.hora, 'ritual de siembra'));
      break;
    case 'SIEMBRA':
      if (!esUna(TECNICAS_SIEMBRA, d.tecnica)) errores.push({ campo: 'tecnica', mensaje: 'Elige la técnica.' });
      if (!esUna(TIPOS_SIEMBRA, d.tipoSiembra)) errores.push({ campo: 'tipoSiembra', mensaje: 'Elige el tipo de siembra.' });
      if (e.hora && HORA.test(e.hora) && (e.hora < '08:00' || e.hora > '09:59'))
        adv.push({ codigo: 'HORA_SIEMBRA', mensaje: 'Se recomienda sembrar desde las 8:00, después del ritual de la salida del sol.' });
      break;
    case 'SENALETICA': {
      const color = d.color;
      if (!esUna(COLORES_SENALETICA, color)) errores.push({ campo: 'color', mensaje: 'Elige el color de la señalética.' });
      else if ((ctx.cualidad === 'CALIENTE') !== (color === 'ROJO'))
        errores.push({
          campo: 'color',
          mensaje: ctx.cualidad === 'CALIENTE' ? 'Esta planta es caliente: su señalética va en rojo.' : 'Esta planta es fría: su señalética va en verde o blanco.',
        });
      if (d.incluyeNombres !== true) errores.push({ campo: 'incluyeNombres', mensaje: 'Confirma que la señalética incluye los nombres de la planta.' });
      if (d.incluyeUsos !== true) errores.push({ campo: 'incluyeUsos', mensaje: 'Confirma que la señalética incluye el uso general.' });
      break;
    }
    case 'CUIDADO_CRECIMIENTO': {
      const labores = Array.isArray(d.labores) ? d.labores : [];
      if (!labores.length || !labores.every((l) => esUna(LABORES_CUIDADO, l)))
        errores.push({ campo: 'labores', mensaje: 'Elige al menos una labor de cuidado.' });
      break;
    }
    case 'RIEGO':
      if (!esUna(METODOS_RIEGO, d.metodo)) errores.push({ campo: 'metodo', mensaje: 'Elige el método de riego (el aspersor no se usa).' });
      break;
    case 'RITUAL_GRATITUD':
      adv.push(...amanecer(e.hora, 'ritual de gratitud'));
      break;
    case 'COSECHA': {
      if (!esUna(PARTES_COSECHA, d.parte)) {
        errores.push({ campo: 'parte', mensaje: 'Elige la parte cosechada.' });
      } else {
        const parte = d.parte as keyof typeof PARTES_COSECHA;
        const raiz = parte === 'SEMILLAS' || parte === 'RAICES';
        adv.push(...advertenciaFase(fase, raiz ? ['MENGUANTE'] : ['CRECIENTE', 'LLENA'], `cosechar ${PARTES_COSECHA[parte].toLowerCase()}`));
      }
      if (e.hora && HORA.test(e.hora) && e.hora < '08:00')
        adv.push({ codigo: 'ROCIO', mensaje: 'Se recomienda cosechar después de las 8:00, cuando el sol secó el rocío.' });
      if (ctx.fechaBano && e.fecha && fase && diasEntre(ctx.fechaBano, e.fecha) !== 2)
        adv.push({ codigo: 'BANO', mensaje: 'El baño de las plantas se recomienda dos días antes de la cosecha.' });
      break;
    }
    case 'SECADO': {
      if (!esUna(LUGARES_SECADO, d.lugar)) errores.push({ campo: 'lugar', mensaje: 'Elige dónde se secaron las plantas.' });
      else if (d.lugar === 'SOL') errores.push({ campo: 'lugar', mensaje: 'Las plantas medicinales se secan a la sombra, nunca al sol.' });
      const dias = Number(d.dias);
      if (!Number.isInteger(dias) || dias < 1) errores.push({ campo: 'dias', mensaje: 'Indica cuántos días duró el secado.' });
      else if (dias < 10 || dias > 15) adv.push({ codigo: 'DIAS_SECADO', mensaje: 'El secado recomendado es de 10 a 15 días a la sombra.' });
      break;
    }
    case 'EMPAQUETADO': {
      const cantidad = Number(d.cantidad);
      if (!Number.isInteger(cantidad) || cantidad < 1) errores.push({ campo: 'cantidad', mensaje: 'Indica cuántos paquetes se hicieron.' });
      for (const [campo, nombre] of [
        ['indicacionesUso', 'Las indicaciones de uso'],
        ['dosificacion', 'La dosificación'],
        ['contraindicaciones', 'Las contraindicaciones'],
      ] as const) {
        if (!texto(d[campo])) errores.push({ campo, mensaje: `${nombre} son obligatorias en la etiqueta.` });
      }
      const cad = texto(d.fechaCaducidad);
      if (!FECHA.test(cad) || !faseLunar(cad)) errores.push({ campo: 'fechaCaducidad', mensaje: 'Indica la fecha de caducidad.' });
      else if (e.fecha && fase) {
        if (cad <= e.fecha) errores.push({ campo: 'fechaCaducidad', mensaje: 'La caducidad debe ser posterior al empaquetado.' });
        else if (diasEntre(e.fecha, cad) > 366) errores.push({ campo: 'fechaCaducidad', mensaje: `La caducidad máxima es de ${MESES_CADUCIDAD_MAX} meses.` });
      }
      break;
    }
    // BANO_PREVIO_COSECHA y LIMPIEZA no piden más datos.
  }

  if (paso.fases && tipo !== 'COSECHA') adv.unshift(...advertenciaFase(fase, paso.fases, paso.nombre.toLowerCase()));
  return { errores, advertencias: errores.length ? [] : adv, faseLunar: fase };
}
