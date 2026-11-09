import type {
  CategoriaAporte,
  CausaFracaso,
  CicloPlanta,
  CualidadPlanta,
  EspacioBodega,
  EstadoSolicitud,
  Genero,
  NivelMiembro,
  Rol,
  TipoAbono,
  TipoAgua,
  TipoCerca,
  TipoDiseno,
  TipoSuelo,
  VarianteDiseno,
} from './enums';

// Nombres para mostrar de cada enum. Una sola fuente para la interfaz, la API y los correos.

export const NOMBRE_ROL: Record<Rol, string> = {
  RESPONSABLE: 'Responsable de huerto',
  TECNICO_MSP: 'Técnico del MSP',
  ADMIN: 'Administrador del sistema',
};

export const NOMBRE_NIVEL: Record<NivelMiembro, string> = { APRENDIZ: 'Aprendiz', OFICIAL: 'Oficial', MAESTRO: 'Maestro' };

export const NOMBRE_GENERO: Record<Genero, string> = {
  FEMENINO: 'Femenino',
  MASCULINO: 'Masculino',
  OTRO: 'Otro',
  PREFIERO_NO_DECIR: 'Prefiero no decir',
};

export const NOMBRE_CICLO: Record<CicloPlanta, string> = { CORTO: 'Ciclo corto', LARGO: 'Ciclo largo' };
export const NOMBRE_CUALIDAD: Record<CualidadPlanta, string> = { CALIENTE: 'Caliente', FRIA: 'Fría' };

/** Tipos de huerto según la definición del proyecto; el ranking se separa por tipo. */
export const NOMBRE_DISENO: Record<TipoDiseno, string> = {
  EN_TIERRA: 'En tierra',
  VERTICAL: 'Vertical',
  COLGANTE: 'Colgante',
  EN_PISO: 'En piso',
};

export const NOMBRE_VARIANTE: Record<VarianteDiseno, string> = {
  SURCO: 'Surcos',
  CAMADA: 'Camadas',
  CAMELLON: 'Camellones',
  TERRAZA: 'Terrazas',
  PARED: 'Paredes',
  TECHO: 'Techos',
  MACETERO: 'Maceteros',
  BOTELLA: 'Botellas',
  LLANTA_PATIO: 'Llantas en patio',
  TERRAZA_PISO: 'Terraza (piso)',
  GRADA: 'Gradas',
  BALCON: 'Balcones',
  FILO_VENTANA: 'Filos de ventana',
};

export const VARIANTES_POR_DISENO: Record<TipoDiseno, VarianteDiseno[]> = {
  EN_TIERRA: ['SURCO', 'CAMADA', 'CAMELLON', 'TERRAZA'],
  VERTICAL: ['PARED'],
  COLGANTE: ['TECHO'],
  EN_PISO: ['MACETERO', 'BOTELLA', 'LLANTA_PATIO', 'TERRAZA_PISO', 'GRADA', 'BALCON', 'FILO_VENTANA'],
};

/** Reunión MSP: un huerto puede tener hasta 3 subtipos con el mismo responsable y voluntarios. */
export const MAX_SUBTIPOS = 3;

export const NOMBRE_CERCA: Record<TipoCerca, string> = {
  VIVA: 'Cerca viva (higuerilla, floripondio, agave, lavanda, frutales)',
  MATERIAL_NATURAL: 'Material natural (caña guadua, bahareque, tapial)',
  MATERIAL_RECICLADO: 'Material reciclado (tablas, botellas, neumáticos)',
  METALICA: 'Metálica (alambre de púas)',
  CONVENCIONAL: 'Convencional (piedra, ladrillo, bloque)',
};

export const NOMBRE_SUELO: Record<TipoSuelo, string> = {
  ARCILLOSO: 'Arcilloso',
  LIMOSO: 'Limoso',
  ARENOSO: 'Arenoso',
  MARGOSO: 'Margoso',
  GREDOSO: 'Gredoso',
  PANTANOSO: 'Pantanoso',
};

export const NOMBRE_AGUA: Record<TipoAgua, string> = { RIO: 'Río', CANAL: 'Canal', GOTEO: 'Por goteo', OTRO: 'Otro' };

export const NOMBRE_ABONO: Record<TipoAbono, string> = {
  BARBECHO: 'Barbecho',
  RESTOS_VEGETALES: 'Restos vegetales',
  HOJA: 'Hoja',
  COMPOST: 'Compost',
};

export const NOMBRE_ESPACIO: Record<EspacioBodega, string> = {
  HERRAMIENTAS: 'Herramientas e implementos',
  SEMILLAS_PLANTULAS: 'Semillas, estacas, esquejes y plántulas',
  ABONOS: 'Abonos orgánicos y compost',
};

/** Pendiente de la reunión: lista de causas de fracaso de una cosecha (propuesta del equipo). */
export const NOMBRE_CAUSA: Record<CausaFracaso, string> = {
  HELADA: 'Helada',
  SEQUIA: 'Sequía o falta de agua',
  EXCESO_LLUVIA: 'Exceso de lluvia o inundación',
  PLAGA: 'Plaga',
  ENFERMEDAD: 'Enfermedad de la planta',
  ANIMALES: 'Daño por animales',
  DESCUIDO: 'Descuido o falta de cuidado',
  ROBO_DANO: 'Robo o daño de terceros',
  OTRA: 'Otra causa',
};

export const NOMBRE_ESTADO_SOLICITUD: Record<EstadoSolicitud, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
};

export const NOMBRE_CATEGORIA: Record<CategoriaAporte, string> = {
  PRACTICAS: 'Prácticas',
  SABERES: 'Saberes',
  SENTIRES: 'Sentires',
};

/** Reglas de participación del foro (las ve todo el público y se aceptan al publicar). */
export const REGLAS_FORO = [
  'Comparte prácticas, saberes y sentires sobre el cultivo y uso de plantas medicinales.',
  'Respeta a las personas, a sus pueblos y a sus saberes. No se admiten insultos ni discriminación.',
  'No recomiendes dosis ni reemplaces la atención médica: ante síntomas graves, acude al centro de salud.',
  'No publiques datos personales tuyos ni de otras personas.',
  'Sin publicidad ni venta de productos.',
  'El técnico del MSP modera el foro y puede retirar aportes que incumplan estas reglas, indicando el motivo.',
];
