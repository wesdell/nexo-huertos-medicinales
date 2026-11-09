// Espejo de los enums de apps/backend/prisma/schema.prisma.
// shared.test.ts falla si se desincronizan.

const enumDe = <T extends string>(...valores: T[]) => Object.fromEntries(valores.map((v) => [v, v])) as { [K in T]: K };
type Valores<T> = T[keyof T];

export const FaseLunar = enumDe('LUNA_NUEVA', 'CRECIENTE', 'LLENA', 'MENGUANTE');
export type FaseLunar = Valores<typeof FaseLunar>;

export const TipoActividad = enumDe(
  'PREPARACION_TIERRA',
  'ESTRUCTURA_SIEMBRA',
  'RITUAL_SIEMBRA',
  'SIEMBRA',
  'SENALETICA',
  'CUIDADO_CRECIMIENTO',
  'RIEGO',
  'BANO_PREVIO_COSECHA',
  'RITUAL_GRATITUD',
  'COSECHA',
  'LIMPIEZA',
  'SECADO',
  'EMPAQUETADO',
);
export type TipoActividad = Valores<typeof TipoActividad>;

export const Rol = enumDe('RESPONSABLE', 'TECNICO_MSP', 'ADMIN');
export type Rol = Valores<typeof Rol>;

export const NivelMiembro = enumDe('APRENDIZ', 'OFICIAL', 'MAESTRO');
export type NivelMiembro = Valores<typeof NivelMiembro>;

export const Genero = enumDe('FEMENINO', 'MASCULINO', 'OTRO', 'PREFIERO_NO_DECIR');
export type Genero = Valores<typeof Genero>;

export const CicloPlanta = enumDe('CORTO', 'LARGO');
export type CicloPlanta = Valores<typeof CicloPlanta>;

export const CualidadPlanta = enumDe('CALIENTE', 'FRIA');
export type CualidadPlanta = Valores<typeof CualidadPlanta>;

export const Region = enumDe('SIERRA', 'COSTA', 'AMAZONIA', 'GALAPAGOS');
export type Region = Valores<typeof Region>;

export const TipoDiseno = enumDe('EN_TIERRA', 'VERTICAL', 'COLGANTE', 'EN_PISO');
export type TipoDiseno = Valores<typeof TipoDiseno>;

export const VarianteDiseno = enumDe(
  'SURCO',
  'CAMADA',
  'CAMELLON',
  'TERRAZA',
  'PARED',
  'TECHO',
  'MACETERO',
  'BOTELLA',
  'LLANTA_PATIO',
  'TERRAZA_PISO',
  'GRADA',
  'BALCON',
  'FILO_VENTANA',
);
export type VarianteDiseno = Valores<typeof VarianteDiseno>;

export const TipoCerca = enumDe('VIVA', 'MATERIAL_NATURAL', 'MATERIAL_RECICLADO', 'METALICA', 'CONVENCIONAL');
export type TipoCerca = Valores<typeof TipoCerca>;

export const TipoSuelo = enumDe('ARCILLOSO', 'LIMOSO', 'ARENOSO', 'MARGOSO', 'GREDOSO', 'PANTANOSO');
export type TipoSuelo = Valores<typeof TipoSuelo>;

export const TipoAgua = enumDe('RIO', 'CANAL', 'GOTEO', 'OTRO');
export type TipoAgua = Valores<typeof TipoAgua>;

export const TipoAbono = enumDe('BARBECHO', 'RESTOS_VEGETALES', 'HOJA', 'COMPOST');
export type TipoAbono = Valores<typeof TipoAbono>;

export const EspacioBodega = enumDe('HERRAMIENTAS', 'SEMILLAS_PLANTULAS', 'ABONOS');
export type EspacioBodega = Valores<typeof EspacioBodega>;

export const TipoArchivo = enumDe('FOTO', 'VIDEO');
export type TipoArchivo = Valores<typeof TipoArchivo>;

export const EstadoSolicitud = enumDe('PENDIENTE', 'APROBADA', 'RECHAZADA');
export type EstadoSolicitud = Valores<typeof EstadoSolicitud>;

export const EstadoCiclo = enumDe('ACTIVO', 'COMPLETADO', 'FALLIDO');
export type EstadoCiclo = Valores<typeof EstadoCiclo>;

/** SIN_EVIDENCIA: paso no cumplido (saltado); no se revisa ni suma puntos. */
export const EstadoEvidencia = enumDe('PENDIENTE', 'APROBADA', 'RECHAZADA', 'SIN_EVIDENCIA');
export type EstadoEvidencia = Valores<typeof EstadoEvidencia>;

export const CausaFracaso = enumDe(
  'HELADA',
  'SEQUIA',
  'EXCESO_LLUVIA',
  'PLAGA',
  'ENFERMEDAD',
  'ANIMALES',
  'DESCUIDO',
  'ROBO_DANO',
  'OTRA',
);
export type CausaFracaso = Valores<typeof CausaFracaso>;

export const CategoriaAporte = enumDe('PRACTICAS', 'SABERES', 'SENTIRES');
export type CategoriaAporte = Valores<typeof CategoriaAporte>;

/** HU-001: longitud mínima de la contraseña (la validan la interfaz y la API). */
export const CONTRASENA_MIN = 8;
