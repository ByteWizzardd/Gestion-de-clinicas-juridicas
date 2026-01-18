/**
 * Tipos TypeScript para el sistema de auditoría
 */

// Base para todos los registros de auditoría
export interface AuditRecord {
  id: number;
  fecha: string;
  usuario_accion: string;
  nombre_completo_usuario_accion?: string;
}

// Tipo unificado para registros de auditoría
export type AuditRecordType =
  | 'soporte' | 'soporte-creado'
  | 'cita-eliminada' | 'cita-actualizada' | 'cita-creada'
  | 'usuario-eliminado' | 'usuario-habilitado' | 'usuario-actualizado-campos' | 'usuario-creado'
  | 'solicitante-eliminado' | 'solicitante-actualizado' | 'solicitante-creado'
  | 'estudiante-inscrito' | 'profesor-asignado'
  | 'estado-eliminado' | 'estado-actualizado' | 'estado-insertado'
  | 'materia-eliminada' | 'materia-actualizada' | 'materia-insertada'
  | 'nivel-educativo-eliminado' | 'nivel-educativo-actualizado' | 'nivel-educativo-insertado'
  | 'nucleo-eliminado' | 'nucleo-actualizado' | 'nucleo-insertado'
  | 'condicion-trabajo-eliminada' | 'condicion-trabajo-actualizada' | 'condicion-trabajo-insertada'
  | 'condicion-actividad-eliminada' | 'condicion-actividad-actualizada' | 'condicion-actividad-insertada'
  | 'tipo-caracteristica-eliminado' | 'tipo-caracteristica-actualizado' | 'tipo-caracteristica-insertado'
  | 'semestre-eliminado' | 'semestre-actualizado' | 'semestre-insertado'
  | 'municipio-eliminado' | 'municipio-actualizado' | 'municipio-insertado'
  | 'parroquia-eliminada' | 'parroquia-actualizada' | 'parroquia-insertada'
  | 'categoria-eliminada' | 'categoria-actualizada' | 'categoria-insertada'
  | 'subcategoria-eliminada' | 'subcategoria-actualizada' | 'subcategoria-insertada'
  | 'ambito-legal-eliminado' | 'ambito-legal-actualizado' | 'ambito-legal-insertado'
  | 'caracteristica-eliminada' | 'caracteristica-actualizada' | 'caracteristica-insertada'
  | 'caso-eliminado' | 'caso-actualizado' | 'caso-creado'
  | 'beneficiario-eliminado' | 'beneficiario-actualizado' | 'beneficiario-creado'
  | 'accion-eliminada' | 'accion-actualizada' | 'accion-creada'
  | 'equipo-actualizado';

// Auditoría de soportes eliminados
export interface SoporteAuditRecord {
  id: number;
  num_soporte: number;
  id_caso: number;
  nombre_archivo: string;
  tipo_mime: string | null;
  descripcion: string | null;
  fecha_consignacion: string | null;
  fecha_eliminacion: string;
  fecha: string; // Alias para fecha_eliminacion
  tamano_bytes: number | null;
  usuario_accion: string; // Alias para id_usuario_elimino
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_elimino
  id_usuario_subio: string | null;
  nombres_usuario_subio: string | null;
  apellidos_usuario_subio: string | null;
  nombre_completo_usuario_subio: string | null;
  id_usuario_elimino: string;
  nombres_usuario_elimino: string | null;
  apellidos_usuario_elimino: string | null;
  nombre_completo_usuario_elimino: string | null;
  foto_perfil_usuario_elimino: string | null;
  motivo: string | null;
}

// Auditoría de soportes creados
export interface SoporteCreadoAuditRecord {
  id: number;
  num_soporte: number;
  id_caso: number;
  nombre_archivo: string;
  tipo_mime: string;
  descripcion: string | null;
  fecha_consignacion: string;
  tamano_bytes: number | null;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_subio
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_subio
  id_usuario_subio: string | null;
  nombres_usuario_subio: string | null;
  apellidos_usuario_subio: string | null;
  nombre_completo_usuario_subio: string | null;
  foto_perfil_usuario_subio: string | null;
}

// Usuario que atendió una cita
export interface UsuarioAtendio {
  id_usuario: string;
  nombres: string | null;
  apellidos: string | null;
  nombre_completo: string | null;
  fecha_registro: string;
}

// Auditoría de citas eliminadas
export interface CitaEliminadaAuditRecord {
  id: number;
  num_cita: number;
  id_caso: number;
  fecha_encuentro: string;
  fecha_proxima_cita: string | null;
  orientacion: string;
  fecha_eliminacion: string;
  fecha: string; // Alias para fecha_eliminacion
  usuario_accion: string; // Alias para id_usuario_elimino
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_elimino
  id_usuario_registro: string | null;
  nombres_usuario_registro: string | null;
  apellidos_usuario_registro: string | null;
  nombre_completo_usuario_registro: string | null;
  id_usuario_elimino: string;
  nombres_usuario_elimino: string | null;
  apellidos_usuario_elimino: string | null;
  nombre_completo_usuario_elimino: string | null;
  foto_perfil_usuario_elimino: string | null;
  motivo: string | null;
  usuarios_atendieron?: UsuarioAtendio[];
}

// Auditoría de citas actualizadas
export interface CitaActualizadaAuditRecord {
  id: number;
  num_cita: number;
  id_caso: number;
  // Valores anteriores
  fecha_encuentro_anterior: string | null;
  fecha_proxima_cita_anterior: string | null;
  orientacion_anterior: string | null;
  // Valores nuevos
  fecha_encuentro_nueva: string | null;
  fecha_proxima_cita_nueva: string | null;
  orientacion_nueva: string | null;
  // Información de auditoría
  id_usuario_actualizo: string;
  usuario_accion: string; // Alias para id_usuario_actualizo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_actualizo
  nombres_usuario_actualizo: string | null;
  apellidos_usuario_actualizo: string | null;
  nombre_completo_usuario_actualizo: string | null;
  foto_perfil_usuario_actualizo: string | null;
  fecha_actualizacion: string;
  fecha: string; // Alias para fecha_actualizacion
  usuarios_atendieron?: UsuarioAtendio[];
}

// Auditoría de citas creadas
export interface CitaCreadaAuditRecord {
  id: number;
  num_cita: number;
  id_caso: number;
  fecha_encuentro: string;
  fecha_proxima_cita: string | null;
  orientacion: string;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
  usuarios_atendieron?: UsuarioAtendio[];
}

// Auditoría de usuarios eliminados (ahora deshabilitados)
export interface UsuarioEliminadoAuditRecord {
  id: number;
  usuario_eliminado: string;
  nombres_usuario_eliminado: string | null;
  apellidos_usuario_eliminado: string | null;
  nombre_completo_usuario_eliminado: string | null;
  eliminado_por: string;
  nombres_eliminado_por: string | null;
  apellidos_eliminado_por: string | null;
  nombre_completo_eliminado_por: string | null;
  foto_perfil_eliminado_por: string | null;
  motivo: string;
  fecha: string;
}

// Auditoría de usuarios habilitados (reactivados)
export interface UsuarioHabilitadoAuditRecord {
  id: number;
  usuario_habilitado: string;
  nombres_usuario_habilitado: string | null;
  apellidos_usuario_habilitado: string | null;
  nombre_completo_usuario_habilitado: string | null;
  habilitado_por: string;
  nombres_habilitado_por: string | null;
  apellidos_habilitado_por: string | null;
  nombre_completo_habilitado_por: string | null;
  foto_perfil_habilitado_por: string | null;
  motivo: string;
  fecha: string;
}

// Auditoría de actualizaciones de campos de usuario (incluyendo cambios de tipo, tipo_estudiante, tipo_profesor)
export interface UsuarioActualizadoCamposAuditRecord {
  id: number;
  ci_usuario: string;
  nombres_usuario: string | null;
  apellidos_usuario: string | null;
  nombre_completo_usuario: string | null;
  foto_perfil_usuario: string | null;
  // Valores anteriores
  nombres_anterior: string | null;
  apellidos_anterior: string | null;
  correo_electronico_anterior: string | null;
  nombre_usuario_anterior: string | null;
  telefono_celular_anterior: string | null;
  habilitado_sistema_anterior: boolean | null;
  tipo_usuario_anterior: string | null;
  tipo_estudiante_anterior: string | null;
  tipo_profesor_anterior: string | null;
  // Valores nuevos
  nombres_nuevo: string | null;
  apellidos_nuevo: string | null;
  correo_electronico_nuevo: string | null;
  nombre_usuario_nuevo: string | null;
  telefono_celular_nuevo: string | null;
  habilitado_sistema_nuevo: boolean | null;
  tipo_usuario_nuevo: string | null;
  tipo_estudiante_nuevo: string | null;
  tipo_profesor_nuevo: string | null;
  // Información de auditoría
  id_usuario_actualizo: string;
  usuario_accion: string; // Alias para id_usuario_actualizo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_actualizo
  nombres_usuario_actualizo: string | null;
  apellidos_usuario_actualizo: string | null;
  nombre_completo_usuario_actualizo: string | null;
  foto_perfil_usuario_actualizo: string | null;
  fecha_actualizacion: string;
  fecha: string; // Alias para fecha_actualizacion
}

// Auditoría de usuarios creados
export interface UsuarioCreadoAuditRecord {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  telefono_celular: string | null;
  habilitado_sistema: boolean;
  tipo_usuario: string;
  tipo_estudiante: string | null;
  term: string | null;
  tipo_profesor: string | null;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
  foto_perfil_usuario?: string | null;
}

// Auditoría de Inserción de Estudiantes
export interface EstudianteInscritoAuditRecord extends AuditRecord {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  telefono_celular: string | null;
  tipo_usuario: string;
  tipo_estudiante: string;
  term: string;
  nrc: string;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
  foto_perfil_usuario?: string | null;
}

// Auditoría de Inserción de Profesores
export interface ProfesorCreadoAuditRecord extends AuditRecord {
  cedula: string;
  nombres: string;
  apellidos: string;
  correo_electronico: string;
  nombre_usuario: string;
  telefono_celular: string | null;
  tipo_usuario: string;
  tipo_profesor: string | null;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
  foto_perfil_usuario?: string | null;
}

// Auditoría de casos eliminados
export interface CasoEliminadoAuditRecord {
  id: number;
  caso_eliminado: number;
  fecha_solicitud: string | null;
  fecha_inicio_caso: string | null;
  fecha_fin_caso: string | null;
  tramite: string | null;
  observaciones: string | null;
  id_nucleo: number | null;
  nombre_nucleo: string | null;
  cedula_solicitante: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  id_materia: number | null;
  nombre_materia: string | null;
  num_categoria: number | null;
  nombre_categoria: string | null;
  num_subcategoria: number | null;
  nombre_subcategoria: string | null;
  num_ambito_legal: number | null;
  ambito_legal: string | null;
  eliminado_por: string | null;
  nombres_usuario_elimino: string | null;
  apellidos_usuario_elimino: string | null;
  nombre_completo_usuario_elimino: string | null;
  motivo: string;
  fecha: string;
  usuario_accion: string; // Alias para eliminado_por
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_elimino
}

// Auditoría de casos actualizados
export interface CasoActualizadoAuditRecord {
  id: number;
  id_caso: number | null;
  // Tipo de cambio: actualizacion_campos o cambio_estatus
  tipo_cambio?: 'actualizacion_campos' | 'cambio_estatus';
  fecha_solicitud_anterior: string | null;
  fecha_solicitud_nuevo: string | null;
  fecha_inicio_caso_anterior: string | null;
  fecha_inicio_caso_nuevo: string | null;
  fecha_fin_caso_anterior: string | null;
  fecha_fin_caso_nuevo: string | null;
  tramite_anterior: string | null;
  tramite_nuevo: string | null;
  observaciones_anterior: string | null;
  observaciones_nuevo: string | null;
  id_nucleo_anterior: number | null;
  id_nucleo_nuevo: number | null;
  nombre_nucleo_anterior: string | null;
  nombre_nucleo_nuevo: string | null;
  cedula_solicitante_anterior: string | null;
  cedula_solicitante_nuevo: string | null;
  id_materia_anterior: number | null;
  id_materia_nuevo: number | null;
  nombre_materia_anterior: string | null;
  nombre_materia_nuevo: string | null;
  num_categoria_anterior: number | null;
  num_categoria_nuevo: number | null;
  nombre_categoria_anterior: string | null;
  nombre_categoria_nuevo: string | null;
  num_subcategoria_anterior: number | null;
  num_subcategoria_nuevo: number | null;
  nombre_subcategoria_anterior: string | null;
  nombre_subcategoria_nuevo: string | null;
  num_ambito_legal_anterior: number | null;
  num_ambito_legal_nuevo: number | null;
  nombre_ambito_legal_anterior: string | null;
  nombre_ambito_legal_nuevo: string | null;
  // Campos de cambio de estatus
  estatus_anterior: string | null;
  estatus_nuevo: string | null;
  id_usuario_actualizo: string | null;
  nombres_usuario_actualizo: string | null;
  apellidos_usuario_actualizo: string | null;
  nombre_completo_usuario_actualizo: string | null;
  foto_perfil_usuario_actualizo: string | null;
  fecha_actualizacion: string;
  fecha: string; // Alias para fecha_actualizacion
  usuario_accion: string; // Alias para id_usuario_actualizo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_actualizo
  motivo?: string | null;

}

// Auditoría de casos creados
export interface CasoCreadoAuditRecord {
  id: number;
  id_caso: number | null;
  fecha_solicitud: string | null;
  fecha_inicio_caso: string | null;
  fecha_fin_caso: string | null;
  tramite: string | null;
  observaciones: string | null;
  id_nucleo: number | null;
  nombre_nucleo: string | null;
  cedula_solicitante: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  id_materia: number | null;
  nombre_materia: string | null;
  num_categoria: number | null;
  nombre_categoria: string | null;
  num_subcategoria: number | null;
  nombre_subcategoria: string | null;
  num_ambito_legal: number | null;
  ambito_legal: string | null;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string | null;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
}

// Auditoría de solicitantes eliminados
export interface SolicitanteEliminadoAuditRecord {
  id: number;
  solicitante_eliminado: string;
  nombres_solicitante_eliminado: string | null;
  apellidos_solicitante_eliminado: string | null;
  nombre_completo_solicitante_eliminado: string | null;
  // Datos personales
  fecha_nacimiento: string | null;
  telefono_local: string | null;
  telefono_celular: string | null;
  correo_electronico: string | null;
  sexo: string | null;
  nacionalidad: string | null;
  estado_civil: string | null;
  concubinato: boolean | null;
  tipo_tiempo_estudio: string | null;
  tiempo_estudio: number | null;
  nivel_educativo: string | null;
  condicion_trabajo: string | null;
  condicion_actividad: string | null;
  // Ubicación
  estado: string | null;
  municipio: string | null;
  parroquia: string | null;
  // Vivienda
  cant_habitaciones: number | null;
  cant_banos: number | null;
  caracteristicas_vivienda: { tipo: string; caracteristica: string }[] | null;
  // Familia y hogar
  cant_personas: number | null;
  cant_trabajadores: number | null;
  cant_no_trabajadores: number | null;
  cant_ninos: number | null;
  cant_ninos_estudiando: number | null;
  jefe_hogar: boolean | null;
  ingresos_mensuales: number | null;
  nivel_educativo_jefe: string | null;
  // Auditoría
  eliminado_por: string | null;
  nombres_usuario_elimino: string | null;
  apellidos_usuario_elimino: string | null;
  nombre_completo_usuario_elimino: string | null;
  foto_perfil_usuario_elimino: string | null;
  motivo: string;
  fecha: string;
  usuario_accion: string; // Alias para eliminado_por
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_elimino
}

// Auditoría de solicitantes actualizados
export interface SolicitanteActualizadoAuditRecord {
  id: number;
  cedula_solicitante: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  nombres_anterior: string | null;
  nombres_nuevo: string | null;
  apellidos_anterior: string | null;
  apellidos_nuevo: string | null;
  fecha_nacimiento_anterior: string | null;
  fecha_nacimiento_nuevo: string | null;
  telefono_local_anterior: string | null;
  telefono_local_nuevo: string | null;
  telefono_celular_anterior: string | null;
  telefono_celular_nuevo: string | null;
  correo_electronico_anterior: string | null;
  correo_electronico_nuevo: string | null;
  sexo_anterior: string | null;
  sexo_nuevo: string | null;
  nacionalidad_anterior: string | null;
  nacionalidad_nuevo: string | null;
  estado_civil_anterior: string | null;
  estado_civil_nuevo: string | null;
  concubinato_anterior: boolean | null;
  concubinato_nuevo: boolean | null;
  tipo_tiempo_estudio_anterior: string | null;
  tipo_tiempo_estudio_nuevo: string | null;
  tiempo_estudio_anterior: number | null;
  tiempo_estudio_nuevo: number | null;
  id_nivel_educativo_anterior: number | null;
  id_nivel_educativo_nuevo: number | null;
  nivel_educativo_anterior: string | null;
  nivel_educativo_nuevo: string | null;
  id_trabajo_anterior: number | null;
  id_trabajo_nuevo: number | null;
  condicion_trabajo_anterior: string | null;
  condicion_trabajo_nuevo: string | null;
  id_actividad_anterior: number | null;
  id_actividad_nuevo: number | null;
  condicion_actividad_anterior: string | null;
  condicion_actividad_nuevo: string | null;
  id_estado_anterior: number | null;
  id_estado_nuevo: number | null;
  estado_anterior: string | null;
  estado_nuevo: string | null;
  num_municipio_anterior: number | null;
  num_municipio_nuevo: number | null;
  municipio_anterior: string | null;
  municipio_nuevo: string | null;
  num_parroquia_anterior: number | null;
  num_parroquia_nuevo: number | null;
  parroquia_anterior: string | null;
  parroquia_nuevo: string | null;
  jefe_hogar_anterior: boolean | null;
  jefe_hogar_nuevo: boolean | null;
  nivel_educativo_jefe_anterior: string | null;
  nivel_educativo_jefe_nuevo: string | null;
  ingresos_mensuales_anterior: number | null;
  ingresos_mensuales_nuevo: number | null;
  // Datos de vivienda
  cant_habitaciones_anterior: number | null;
  cant_habitaciones_nuevo: number | null;
  cant_banos_anterior: number | null;
  cant_banos_nuevo: number | null;
  // Datos de familia/hogar
  cant_personas_anterior: number | null;
  cant_personas_nuevo: number | null;
  cant_trabajadores_anterior: number | null;
  cant_trabajadores_nuevo: number | null;
  cant_no_trabajadores_anterior: number | null;
  cant_no_trabajadores_nuevo: number | null;
  cant_ninos_anterior: number | null;
  cant_ninos_nuevo: number | null;
  cant_ninos_estudiando_anterior: number | null;
  cant_ninos_estudiando_nuevo: number | null;
  artefactos_eliminados: string[]; // Artefactos que tenía antes pero ya no
  artefactos_agregados: string[]; // Artefactos nuevos que no tenía antes
  artefactos_sin_cambio: string[]; // Artefactos que tenía y sigue teniendo
  id_usuario_actualizo: string | null;
  nombres_usuario_actualizo: string | null;
  apellidos_usuario_actualizo: string | null;
  nombre_completo_usuario_actualizo: string | null;
  foto_perfil_usuario_actualizo: string | null;
  fecha_actualizacion: string;
  fecha: string; // Alias para fecha_actualizacion
  usuario_accion: string; // Alias para id_usuario_actualizo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_actualizo
}

// Auditoría de solicitantes creados
export interface SolicitanteCreadoAuditRecord {
  id: number;
  cedula: string | null;
  nombres: string | null;
  apellidos: string | null;
  fecha_nacimiento: string | null;
  telefono_local: string | null;
  telefono_celular: string | null;
  correo_electronico: string | null;
  sexo: string | null;
  nacionalidad: string | null;
  estado_civil: string | null;
  concubinato: boolean | null;
  tipo_tiempo_estudio: string | null;
  tiempo_estudio: number | null;
  id_nivel_educativo: number | null;
  nivel_educativo: string | null;
  id_trabajo: number | null;
  condicion_trabajo: string | null;
  id_actividad: number | null;
  condicion_actividad: string | null;
  id_estado: number | null;
  nombre_estado: string | null;
  num_municipio: number | null;
  nombre_municipio: string | null;
  num_parroquia: number | null;
  nombre_parroquia: string | null;
  fecha_creacion: string;
  fecha: string; // Alias para fecha_creacion
  usuario_accion: string; // Alias para id_usuario_creo
  nombre_completo_usuario_accion?: string; // Alias para nombre_completo_usuario_creo
  id_usuario_creo: string | null;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
}

// Filtros para consultas de auditoría
export interface AuditFilters {
  fechaInicio?: string;
  fechaFin?: string;
  idUsuario?: string;
  busqueda?: string;
  orden?: 'asc' | 'desc'; // 'desc' = más reciente primero (por defecto), 'asc' = más antiguo primero
  cedulaSolicitante?: string; // Para casos y solicitantes
  idCaso?: number; // Para casos
  eliminadoPor?: string; // Para eliminaciones
  tipoRegistro?: string; // Para filtrar por tipo (ej: usuario-creado, estudiante-inscrito)
}

// Contadores de auditoría
export interface AuditCounts {
  soportes: number;
  soportesCreados: number;
  citasEliminadas: number;
  citasActualizadas: number;
  citasCreadas: number;
  usuariosEliminados: number;
  usuariosHabilitados: number;
  usuariosActualizadosCampos: number;
  usuariosCreados: number;
  estadosEliminados?: number;
  estadosActualizados?: number;
  materiasEliminadas?: number;
  materiasActualizadas?: number;
  nivelesEducativosEliminados?: number;
  nivelesEducativosActualizados?: number;
  nucleosEliminados?: number;
  nucleosActualizados?: number;
  condicionesTrabajoEliminadas?: number;
  condicionesTrabajoActualizadas?: number;
  condicionesActividadEliminadas?: number;
  condicionesActividadActualizadas?: number;
  tiposCaracteristicasEliminados?: number;
  tiposCaracteristicasActualizados?: number;
  semestresEliminados?: number;
  semestresActualizados?: number;
  municipiosEliminados?: number;
  municipiosActualizados?: number;
  parroquiasEliminadas?: number;
  parroquiasActualizadas?: number;
  categoriasEliminadas?: number;
  categoriasActualizadas?: number;
  subcategoriasEliminadas?: number;
  subcategoriasActualizadas?: number;
  ambitosLegalesEliminados?: number;
  ambitosLegalesActualizados?: number;
  caracteristicasEliminadas?: number;
  caracteristicasActualizadas?: number;
  // Inserciones
  estadosInsertados?: number;
  materiasInsertadas?: number;
  nivelesEducativosInsertados?: number;
  nucleosInsertados?: number;
  condicionesTrabajoInsertadas?: number;
  condicionesActividadInsertadas?: number;
  tiposCaracteristicasInsertados?: number;
  semestresInsertados?: number;
  municipiosInsertados?: number;
  parroquiasInsertadas?: number;
  categoriasInsertadas?: number;
  subcategoriasInsertadas?: number;
  ambitosLegalesInsertados?: number;
  caracteristicasInsertadas?: number;
  // Casos
  casosEliminados?: number;
  casosActualizados?: number;
  casosCreados?: number;
  // Solicitantes
  solicitantesEliminados?: number;
  solicitantesActualizados?: number;
  solicitantesCreados?: number;
  // Inscripciones y Asignaciones
  estudiantesInscritos?: number;
  profesoresAsignados?: number;
  // Beneficiarios
  beneficiariosCreados?: number;
  beneficiariosActualizados?: number;
  beneficiariosEliminados?: number;
  // Acciones en casos
  accionesCreadas?: number;
  accionesActualizadas?: number;
  accionesEliminadas?: number;
  // Equipo de casos
  equiposActualizados?: number;
}

// Auditoría de Beneficiarios
export interface BeneficiarioInscritoAuditRecord extends AuditRecord {
  num_beneficiario: number;
  id_caso: number;
  numero_expediente?: string;
  cedula: string | null;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: string;
  tipo_beneficiario: string;
  parentesco: string;
  fecha_creacion: string;
  id_usuario_registro: string | null;
  usuario_nombre_completo?: string;
  fecha_registro: string;
  comunidad?: string | null;
}

export interface BeneficiarioActualizadoAuditRecord extends AuditRecord {
  num_beneficiario: number;
  id_caso: number;
  numero_expediente?: string;

  cedula_anterior: string | null;
  nombres_anterior: string;
  apellidos_anterior: string;
  fecha_nacimiento_anterior: string;
  sexo_anterior: string;
  tipo_beneficiario_anterior: string;
  parentesco_anterior: string;

  cedula_nuevo: string | null;
  nombres_nuevo: string;
  apellidos_nuevo: string;
  fecha_nacimiento_nuevo: string;
  sexo_nuevo: string;
  tipo_beneficiario_nuevo: string;
  parentesco_nuevo: string;

  fecha_actualizacion: string;
  nombres?: string;
  id_usuario_actualizo: string | null;
  usuario_nombre_completo?: string;
  cedula?: string | null;
  ingresos_anterior?: number | null;
  ingresos_nuevo?: number | null;
  edad_mental_anterior?: number | null;
  edad_mental_nuevo?: number | null;
}

export interface BeneficiarioEliminadoAuditRecord extends AuditRecord {
  num_beneficiario: number;
  id_caso: number | null;
  numero_expediente?: string;
  cedula: string | null;
  nombres: string;
  apellidos: string;
  fecha_eliminacion: string;
  fecha_nacimiento: string;
  sexo: string;
  tipo_beneficiario: string;
  parentesco: string;
  id_usuario_elimino: string | null;
  usuario_nombre_completo?: string;
  motivo?: string | null;
}

// Auditoría de Acciones en Casos
export interface AccionCreadaAuditRecord extends AuditRecord {
  num_accion: number;
  id_caso: number;
  detalle_accion: string;
  comentario: string | null;
  id_usuario_registra: string | null;
  fecha_registro: string | null;
  id_usuario_creo: string | null;
  fecha_creacion: string;
  tramite_caso: string | null;
  nombre_nucleo: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  nombres_usuario_registra: string | null;
  apellidos_usuario_registra: string | null;
  nombre_completo_usuario_registra: string | null;
  nombres_usuario_creo: string | null;
  apellidos_usuario_creo: string | null;
  nombre_completo_usuario_creo: string | null;
  foto_perfil_usuario_creo: string | null;
  // Ejecutores de la acción (de tabla normalizada o subquery agregada)
  ejecutores: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
}

export interface AccionActualizadaAuditRecord extends AuditRecord {
  num_accion: number;
  id_caso: number;
  detalle_accion_anterior: string | null;
  comentario_anterior: string | null;
  id_usuario_registra_anterior: string | null;
  fecha_registro_anterior: string | null;
  detalle_accion_nuevo: string | null;
  comentario_nuevo: string | null;
  id_usuario_registra_nuevo: string | null;
  fecha_registro_nuevo: string | null;
  id_usuario_actualizo: string | null;
  fecha_actualizacion: string;
  // Ejecutores (de tabla normalizada)
  ejecutores_anterior: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
  ejecutores_nuevo: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
  tramite_caso: string | null;
  nombre_nucleo: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  nombres_usuario_actualizo: string | null;
  apellidos_usuario_actualizo: string | null;
  nombre_completo_usuario_actualizo: string | null;
  foto_perfil_usuario_actualizo: string | null;
}

export interface AccionEliminadaAuditRecord extends AuditRecord {
  num_accion: number;
  id_caso: number;
  detalle_accion: string | null;
  comentario: string | null;
  id_usuario_registra: string | null;
  fecha_registro: string | null;
  eliminado_por: string | null;
  motivo: string;
  // Ejecutores de la acción (de tabla normalizada)
  ejecutores: Array<{ nombre: string; cedula: string; fecha_ejecucion: string }> | string | null;
  tramite_caso: string | null;
  nombre_nucleo: string | null;
  nombres_solicitante: string | null;
  apellidos_solicitante: string | null;
  nombre_completo_solicitante: string | null;
  nombres_usuario_registra: string | null;
  apellidos_usuario_registra: string | null;
  nombre_completo_usuario_registra: string | null;
  nombres_eliminado_por: string | null;
  apellidos_eliminado_por: string | null;
  nombre_completo_eliminado_por: string | null;
  foto_perfil_eliminado_por: string | null;
}

// Auditoría de Actualización de Equipo
export interface MiembroEquipoAudit {
  tipo: 'estudiante' | 'profesor';
  cedula: string;
  nombres: string | null;
  apellidos: string | null;
  nombre_completo: string | null;
  term: string | null;
}

export interface EquipoActualizadoAuditRecord extends AuditRecord {
  id_caso: number;
  id_usuario_modifico: string;
  nombres_usuario_modifico: string | null;
  apellidos_usuario_modifico: string | null;
  nombre_completo_usuario_modifico: string | null;
  foto_perfil_usuario_modifico: string | null;

  // Tablas relacionadas
  miembros_anteriores: MiembroEquipoAudit[];
  miembros_nuevos: MiembroEquipoAudit[];

  // Info extra del caso para mostrar contexto
  tramite_caso: string | null;
  nombre_nucleo: string | null;
  nombre_completo_solicitante: string | null;
}
