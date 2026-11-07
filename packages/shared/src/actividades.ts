import { FaseLunar, TipoActividad, TipoActividadV1, ACTIVIDADES_V1 } from './enums';
import { faseLunar, NOMBRE_FASE } from './lunar';

export const TECNICAS_SIEMBRA = { SURCOS: 'Surcos', TERRAZAS: 'Andenes o terrazas', CAMELLONES: 'Camellones' } as const;
export const TIPOS_SIEMBRA = { SEMILLAS: 'Semillas', ESTACAS: 'Estacas', ESQUEJES: 'Esquejes', PLANTULAS: 'Plántulas' } as const;
// HU-023: el aspersor no se usa, por eso no existe como opción.
export const METODOS_RIEGO = { AGUA_RIEGO: 'Agua de riego', MANGUERA: 'Manguera', REGADERA: 'Regadera de aluminio' } as const;
export const PARTES_COSECHA = { HOJAS: 'Hojas', FLORES: 'Flores', FRUTOS: 'Frutos', SEMILLAS: 'Semillas', RAICES: 'Raíces' } as const;

export const NOMBRE_ACTIVIDAD: Record<TipoActividadV1, string> = {
  PREPARACION_TIERRA: 'Preparación de la tierra',
  SIEMBRA: 'Siembra',
  RIEGO: 'Riego',
  COSECHA: 'Cosecha',
};

export interface EntradaActividad {
  tipo: string;
  fecha?: string; // AAAA-MM-DD
  hora?: string; // HH:mm
  plantaId?: string;
  detalle?: Record<string, unknown>;
}

/** Datos del huerto que el servidor lee antes de validar. */
export interface ContextoActividad {
  plantasDelHuerto: string[];
  plantasSembradas: string[];
  hoy: string; // AAAA-MM-DD, para rechazar fechas futuras
}

export interface ErrorCampo {
  campo: string;
  mensaje: string;
}
export interface Advertencia {
  codigo: 'FASE_LUNAR' | 'ROCIO';
  mensaje: string;
}
export interface ResultadoValidacion {
  errores: ErrorCampo[];
  advertencias: Advertencia[];
  faseLunar: FaseLunar | null;
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const esUna = (obj: object, v: unknown) => typeof v === 'string' && Object.hasOwn(obj, v);

function advertenciaFase(fase: FaseLunar | null, recomendadas: FaseLunar[], que: string): Advertencia[] {
  if (!fase || recomendadas.includes(fase)) return [];
  const nombres = recomendadas.map((f) => NOMBRE_FASE[f].toLowerCase()).join(' o ');
  return [
    {
      codigo: 'FASE_LUNAR',
      mensaje: `Para ${que} se recomienda ${nombres}; en esa fecha hay ${NOMBRE_FASE[fase].toLowerCase()}.`,
    },
  ];
}

/**
 * Valida una actividad de v1 (HU-018, 021, 023, 025).
 * Los errores bloquean el guardado; las advertencias se confirman («guardar de todas formas»).
 */
export function validarActividad(e: EntradaActividad, ctx: ContextoActividad): ResultadoValidacion {
  const errores: ErrorCampo[] = [];
  const advertencias: Advertencia[] = [];
  const d = e.detalle ?? {};

  if (!(ACTIVIDADES_V1 as readonly string[]).includes(e.tipo)) {
    return { errores: [{ campo: 'tipo', mensaje: 'Elige un tipo de actividad válido.' }], advertencias, faseLunar: null };
  }
  const fase = e.fecha ? faseLunar(e.fecha) : null;
  if (!e.fecha) errores.push({ campo: 'fecha', mensaje: 'Indica la fecha.' });
  else if (!fase) errores.push({ campo: 'fecha', mensaje: 'La fecha no es válida (dd/mm/aaaa).' });
  else if (e.fecha > ctx.hoy) errores.push({ campo: 'fecha', mensaje: 'La fecha no puede ser futura.' });
  if (e.hora && !HORA.test(e.hora)) errores.push({ campo: 'hora', mensaje: 'Usa el formato HH:mm.' });

  if (e.tipo === TipoActividad.SIEMBRA || e.tipo === TipoActividad.COSECHA) {
    if (!e.plantaId) errores.push({ campo: 'plantaId', mensaje: 'Elige la planta.' });
    else if (!ctx.plantasDelHuerto.includes(e.plantaId))
      errores.push({ campo: 'plantaId', mensaje: 'Primero registra la planta en el huerto.' });
    if (!e.hora) errores.push({ campo: 'hora', mensaje: 'Indica la hora.' });
  }

  switch (e.tipo as TipoActividadV1) {
    case 'PREPARACION_TIERRA': {
      const pasos: [string, string][] = [
        ['retiroMaleza', 'el retiro de maleza'],
        ['esparcido', 'el esparcido de la maleza'],
        ['remocion', 'la remoción de la tierra'],
      ];
      for (const [campo, nombre] of pasos) {
        if (d[campo] !== true) errores.push({ campo, mensaje: `Confirma ${nombre}.` });
      }
      advertencias.push(...advertenciaFase(fase, ['LUNA_NUEVA'], 'preparar la tierra'));
      break;
    }
    case 'SIEMBRA':
      if (!esUna(TECNICAS_SIEMBRA, d.tecnica)) errores.push({ campo: 'tecnica', mensaje: 'Elige la técnica.' });
      if (!esUna(TIPOS_SIEMBRA, d.tipoSiembra)) errores.push({ campo: 'tipoSiembra', mensaje: 'Elige el tipo de siembra.' });
      // ponytail: sin aviso de ritual previo hasta que exista RITUAL_SIEMBRA (v2).
      advertencias.push(...advertenciaFase(fase, ['CRECIENTE', 'LLENA'], 'sembrar'));
      break;
    case 'RIEGO':
      if (!esUna(METODOS_RIEGO, d.metodo)) errores.push({ campo: 'metodo', mensaje: 'Elige el método de riego.' });
      if (ctx.plantasSembradas.length === 0) errores.push({ campo: 'plantaId', mensaje: 'Primero registra una siembra.' });
      else if (e.plantaId && !ctx.plantasSembradas.includes(e.plantaId))
        errores.push({ campo: 'plantaId', mensaje: 'Esa planta aún no tiene siembra registrada.' });
      break;
    case 'COSECHA': {
      if (e.plantaId && ctx.plantasDelHuerto.includes(e.plantaId) && !ctx.plantasSembradas.includes(e.plantaId))
        errores.push({ campo: 'plantaId', mensaje: 'Primero registra la siembra de esta planta.' });
      if (!esUna(PARTES_COSECHA, d.parte)) {
        errores.push({ campo: 'parte', mensaje: 'Elige la parte cosechada.' });
      } else {
        const parte = d.parte as keyof typeof PARTES_COSECHA;
        const recomendadas: FaseLunar[] = parte === 'SEMILLAS' || parte === 'RAICES' ? ['MENGUANTE'] : ['CRECIENTE', 'LLENA'];
        advertencias.push(...advertenciaFase(fase, recomendadas, `cosechar ${PARTES_COSECHA[parte].toLowerCase()}`));
      }
      if (e.hora && HORA.test(e.hora) && e.hora < '08:00')
        advertencias.push({ codigo: 'ROCIO', mensaje: 'Se recomienda cosechar después de las 8:00, cuando se seca el rocío.' });
      break;
    }
  }
  return { errores, advertencias: errores.length ? [] : advertencias, faseLunar: fase };
}

// HU-030
export const PUNTOS_BASE: Record<TipoActividad, number> = {
  PREPARACION_TIERRA: 10,
  ESTRUCTURA_SIEMBRA: 10,
  RITUAL_SIEMBRA: 10,
  SIEMBRA: 15,
  SENALETICA: 5,
  CUIDADO_CRECIMIENTO: 5,
  RIEGO: 5,
  BANO_PREVIO_COSECHA: 5,
  RITUAL_GRATITUD: 10,
  COSECHA: 15,
  LIMPIEZA: 5,
  SECADO: 10,
  EMPAQUETADO: 15,
};
export const BONO_RECOMENDACION = 5;

/** Puntos de una actividad válida. Repetida (mismo tipo, planta y día) no suma. */
export function puntosPorActividad(tipo: TipoActividad, conAdvertencias: boolean, repetida: boolean) {
  if (repetida) return { base: 0, bono: 0 };
  return { base: PUNTOS_BASE[tipo], bono: conAdvertencias ? 0 : BONO_RECOMENDACION };
}
