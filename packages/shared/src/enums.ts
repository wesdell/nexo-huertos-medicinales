// Espejo de los enums de apps/backend/prisma/schema.prisma usados en v1.
// enums.test.ts falla si se desincronizan.

export const FaseLunar = {
  LUNA_NUEVA: 'LUNA_NUEVA',
  CRECIENTE: 'CRECIENTE',
  LLENA: 'LLENA',
  MENGUANTE: 'MENGUANTE',
} as const;
export type FaseLunar = (typeof FaseLunar)[keyof typeof FaseLunar];

export const TipoActividad = {
  PREPARACION_TIERRA: 'PREPARACION_TIERRA',
  ESTRUCTURA_SIEMBRA: 'ESTRUCTURA_SIEMBRA',
  RITUAL_SIEMBRA: 'RITUAL_SIEMBRA',
  SIEMBRA: 'SIEMBRA',
  SENALETICA: 'SENALETICA',
  CUIDADO_CRECIMIENTO: 'CUIDADO_CRECIMIENTO',
  RIEGO: 'RIEGO',
  BANO_PREVIO_COSECHA: 'BANO_PREVIO_COSECHA',
  RITUAL_GRATITUD: 'RITUAL_GRATITUD',
  COSECHA: 'COSECHA',
  LIMPIEZA: 'LIMPIEZA',
  SECADO: 'SECADO',
  EMPAQUETADO: 'EMPAQUETADO',
} as const;
export type TipoActividad = (typeof TipoActividad)[keyof typeof TipoActividad];

/** Tipos de actividad habilitados en v1.0.0. */
export const ACTIVIDADES_V1 = [
  TipoActividad.PREPARACION_TIERRA,
  TipoActividad.SIEMBRA,
  TipoActividad.RIEGO,
  TipoActividad.COSECHA,
] as const;
export type TipoActividadV1 = (typeof ACTIVIDADES_V1)[number];

export const Genero = {
  FEMENINO: 'FEMENINO',
  MASCULINO: 'MASCULINO',
  OTRO: 'OTRO',
  PREFIERO_NO_DECIR: 'PREFIERO_NO_DECIR',
} as const;
export type Genero = (typeof Genero)[keyof typeof Genero];

export const CicloPlanta = { CORTO: 'CORTO', LARGO: 'LARGO' } as const;
export type CicloPlanta = (typeof CicloPlanta)[keyof typeof CicloPlanta];

export const CualidadPlanta = { CALIENTE: 'CALIENTE', FRIA: 'FRIA' } as const;
export type CualidadPlanta = (typeof CualidadPlanta)[keyof typeof CualidadPlanta];

export const Region = {
  SIERRA: 'SIERRA',
  COSTA: 'COSTA',
  AMAZONIA: 'AMAZONIA',
  GALAPAGOS: 'GALAPAGOS',
} as const;
export type Region = (typeof Region)[keyof typeof Region];
