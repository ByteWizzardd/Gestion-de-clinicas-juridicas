/**
 * Contrato compartido del nuevo sistema de auditoría (auditoria_eventos).
 *
 * Este archivo es la interfaz entre el trabajo de BD/backend (Persona A) y el
 * de frontend (Persona B) definido en /plan-backend-auditoria.md y
 * /plan-frontend-auditoria.md. No renombrar campos aquí sin avisar al otro lado
 * — ambos equipos construyen contra estas formas.
 */

export type AuditOperacion =
  | 'insercion'
  | 'actualizacion'
  | 'eliminacion'
  | 'inicio_sesion'
  | 'generacion_reporte'
  | 'vista_previa_reporte'
  | 'descarga_soporte';

/** Una fila de la tabla auditoria_eventos, tal como la devuelven las server actions. */
export interface AuditoriaEvento {
  id: number;
  entidad: string; // 'caso' | 'usuario' | 'categoria' | 'sesion' | 'equipo' | ... (ver config/audit-entities.ts)
  operacion: AuditOperacion;
  id_entidad: string | null;
  id_usuario: string | null;
  nombre_completo_usuario?: string | null; // resuelto con JOIN a usuarios, para mostrar en UI
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  fecha_evento: string; // ISO 8601
}

export interface AuditoriaEventoFilters {
  entidad?: string;
  operacion?: AuditOperacion;
  idUsuario?: string;
  idEntidad?: string;
  fechaInicio?: string; // ISO date
  fechaFin?: string; // ISO date
  busqueda?: string;
  orden?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/** Resumen agregado por entidad+operación, para los contadores del dashboard de módulos. */
export interface AuditoriaEventoResumen {
  entidad: string;
  operacion: AuditOperacion;
  total: number;
  ultima_actividad: string | null; // ISO 8601
}

export interface AuditoriaEventosPage {
  eventos: AuditoriaEvento[];
  total: number;
}
