/**
 * Constantes de estatus de casos
 */
export const ESTATUS_CASO = {
  EN_PROCESO: 'En proceso',
  ARCHIVADO: 'Archivado',
  ENTREGADO: 'Entregado',
  ASESORIA: 'Asesoría',
} as const;

export type EstatusCaso = typeof ESTATUS_CASO[keyof typeof ESTATUS_CASO];

/**
 * Constantes de trámites
 */
export const TRAMITES = {
  ASESORIA: 'Asesoría',
  CONCILIACION_MEDIACION: 'Conciliación y Mediación',
  REDACCION_DOCUMENTOS: '(Redacción documentos y/o convenio)',
  ASISTENCIA_JUDICIAL: 'Asistencia Judicial - Casos externos',
} as const;

export type Tramite = typeof TRAMITES[keyof typeof TRAMITES];

/**
 * Constantes de tipo de estudiante
 */
export const TIPO_ESTUDIANTE = {
  VOLUNTARIO: 'Voluntario',
  INSCRITO: 'Inscrito',
  EGRESADO: 'Egresado',
} as const;

export type TipoEstudiante = typeof TIPO_ESTUDIANTE[keyof typeof TIPO_ESTUDIANTE];

