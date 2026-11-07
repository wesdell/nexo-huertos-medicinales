import { TipoActividad } from './enums';

export const ETAPAS = [
  { nivel: 0, nombre: 'Sin iniciar', recurso: 'etapa-0-inicial.svg' },
  { nivel: 1, nombre: 'Tierra preparada', recurso: 'etapa-1-tierra-preparada.svg' },
  { nivel: 2, nombre: 'Sembrada', recurso: 'etapa-2-sembrada.svg' },
  { nivel: 3, nombre: 'En cuidado', recurso: 'etapa-3-en-cuidado.svg' },
  { nivel: 4, nombre: 'Cosechada', recurso: 'etapa-4-cosechada.svg' },
  { nivel: 5, nombre: 'En secado', recurso: 'etapa-5-en-secado.svg' },
  { nivel: 6, nombre: 'Empaquetada', recurso: 'etapa-6-empaquetada.svg' },
] as const;
export type Etapa = (typeof ETAPAS)[number];
const MAX = ETAPAS.length - 1;

const NIVEL: Partial<Record<TipoActividad, number>> = {
  PREPARACION_TIERRA: 1,
  SIEMBRA: 2,
  CUIDADO_CRECIMIENTO: 3,
  RIEGO: 3,
  COSECHA: 4,
  SECADO: 5,
  EMPAQUETADO: 6,
};

export interface ActividadResumen {
  tipo: TipoActividad;
  plantaId: string | null;
}

/**
 * HU-016: etapa más avanzada de cada planta y porcentaje del huerto (promedio del avance).
 * Una actividad sin planta aplica a todo el huerto: la preparación a todas las plantas,
 * el riego general solo a las ya sembradas.
 */
export function huertoVirtual(plantas: string[], actividades: ActividadResumen[]) {
  const nivel = new Map(plantas.map((p) => [p, 0]));
  const subir = (p: string, n: number) => nivel.set(p, Math.max(nivel.get(p) ?? 0, n));

  // Primero las actividades por planta, luego las generales (el riego general depende de la siembra).
  const ordenadas = [...actividades].sort((a, b) => Number(!a.plantaId) - Number(!b.plantaId));
  for (const a of ordenadas) {
    const n = NIVEL[a.tipo];
    if (n === undefined) continue;
    if (a.plantaId) {
      if (nivel.has(a.plantaId)) subir(a.plantaId, n);
    } else {
      for (const p of plantas) if (n < 3 || (nivel.get(p) ?? 0) >= 2) subir(p, n);
    }
  }
  const resultado = plantas.map((id) => ({ plantaId: id, etapa: ETAPAS[nivel.get(id) ?? 0] as Etapa }));
  const progreso = plantas.length ? Math.round((resultado.reduce((s, r) => s + r.etapa.nivel, 0) / (plantas.length * MAX)) * 100) : 0;
  return { plantas: resultado, progreso };
}
