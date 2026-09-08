/**
 * Contrato compartido del nuevo sistema de auditoría (auditoria_eventos).
 *
 * Este archivo es la interfaz entre el trabajo de BD/backend (Persona A) y el
 * de frontend (Persona B) definido en /plan-backend-auditoria.md y
 * /plan-frontend-auditoria.md. No renombrar campos aquí sin avisar al otro lado
 * — ambos equipos construyen contra estas formas.
 */

/** Tipo discriminado para el campo 'entidad'. */
export type AuditEntidad =
  | 'caso' | 'usuario' | 'sesion' | 'solicitante' | 'beneficiario'
  | 'cita' | 'equipo' | 'accion_ejecutores' | 'reporte' | 'soporte'
  | 'categoria' | 'subcategoria' | 'ambito_legal' | 'nucleo' | 'materia'
  | 'semestre' | 'nivel_educativo' | 'estado' | 'municipio' | 'parroquia'
  | 'condicion_trabajo' | 'condicion_actividad' | 'tipo_caracteristica'
  | 'caracteristica' | 'solicitante_artefactos' | 'solicitante_perfil'
  | string; // fallback para entidades nuevas sin romper el build

export type AuditOperacion =
  | 'insercion' | 'actualizacion' | 'eliminacion'
  | 'inicio_sesion' | 'cierre_sesion' | 'intento_fallido'
  | 'generacion_reporte' | 'vista_previa_reporte' | 'descarga_soporte';

/** Metadata de negocio que el backend inyecta antes de cada transacción. */
export interface AuditMetadata {
  accion_negocio?: string;   // Texto legible: "Cierre de Caso", "Asignación de Docente"
  modulo?: string;           // Sub-módulo de la acción
  motivo?: string;           // Para eliminaciones y cambios de estatus
  tx_id?: string;            // UUID generado por Next.js para agrupar eventos de una Tx
  ip?: string;
  dispositivo?: string;      // Para sesiones
  fecha_cierre?: string;     // Para sesiones
  tipo_reporte?: string;     // Para reportes
  filtros_aplicados?: Record<string, unknown>; // Para reportes
  [key: string]: unknown;    // Extensible sin cambiar el tipo
}

/** Una fila de la tabla auditoria_eventos, tal como la devuelven las server actions. */
export interface AuditoriaEvento {
  id: number;
  id_transaccion?: number;   // txid_current() de PostgreSQL — para agrupación
  entidad: AuditEntidad;
  operacion: AuditOperacion;
  id_entidad: string | null;
  id_usuario: string | null;
  nombre_completo_usuario?: string | null; // resuelto con JOIN a usuarios, para mostrar en UI
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  metadata: AuditMetadata | null;
  fecha_evento: string; // ISO 8601
}

export interface AuditoriaEventoFilters {
  entidad?: AuditEntidad;
  operacion?: AuditOperacion;
  idUsuario?: string;
  idEntidad?: string;
  fechaInicio?: string; // ISO date
  fechaFin?: string; // ISO date
  busqueda?: string;
  txId?: string;        // Filtra todos los eventos hermanos de una misma transacción de negocio
  idTransaccion?: number; // Filtra por id_transaccion (agrupación SQL exacta)
  orden?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/** Resumen agregado por entidad+operación, para los contadores del dashboard de módulos. */
export interface AuditoriaEventoResumen {
  entidad: AuditEntidad;
  operacion: AuditOperacion;
  total: number;
  ultima_actividad: string | null; // ISO 8601
}

export interface AuditoriaEventosPage {
  eventos: AuditoriaEvento[];
  total: number;
}
