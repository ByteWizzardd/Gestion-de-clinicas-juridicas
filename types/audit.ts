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
  motivo: string | null;
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
  motivo: string | null;
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
  fecha_actualizacion: string;
  fecha: string; // Alias para fecha_actualizacion
}

// Auditoría de usuarios eliminados
export interface UsuarioEliminadoAuditRecord {
  id: number;
  usuario_eliminado: string;
  nombres_usuario_eliminado: string | null;
  apellidos_usuario_eliminado: string | null;
  nombre_completo_usuario_eliminado: string | null;
  eliminado_por: string;
  motivo: string;
  fecha: string;
}

// Auditoría de cambios de tipo de usuario
export interface UsuarioActualizadoAuditRecord {
  id: number;
  ci_usuario: string;
  nombres_usuario: string | null;
  apellidos_usuario: string | null;
  nombre_completo_usuario: string | null;
  tipo_usuario_anterior: string;
  tipo_usuario_nuevo: string;
  actualizado_por: string;
  nombres_actualizado_por: string | null;
  apellidos_actualizado_por: string | null;
  nombre_completo_actualizado_por: string | null;
  fecha: string;
}

// Filtros para consultas de auditoría
export interface AuditFilters {
  fechaInicio?: string;
  fechaFin?: string;
  idUsuario?: string;
  busqueda?: string;
  orden?: 'asc' | 'desc'; // 'desc' = más reciente primero (por defecto), 'asc' = más antiguo primero
}

// Contadores de auditoría
export interface AuditCounts {
  soportes: number;
  citasEliminadas: number;
  citasActualizadas: number;
  usuariosEliminados: number;
  usuariosActualizados: number;
}
