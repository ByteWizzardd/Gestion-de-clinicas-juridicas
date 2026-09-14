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
  | 'cita' | 'equipo' | 'caso_semestre' | 'accion_ejecutores' | 'reporte' | 'soporte'
  | 'cambio_estatus' | 'atencion_cita' | 'vivienda' | 'familia_y_hogar'
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
  nombre_completo_solicitante?: string | null; // resuelto con JOIN a solicitantes (solo entidad='caso'), para mostrar en UI
  // Resueltos con JOIN a nucleos/materias/categorias/subcategorias/
  // ambitos_legales/solicitantes (solo entidad='caso', actualizaciones que
  // tocan esos campos), para mostrar nombres en vez de IDs crudos.
  nombre_nucleo_anterior?: string | null;
  nombre_nucleo_nuevo?: string | null;
  nombre_materia_anterior?: string | null;
  nombre_materia_nuevo?: string | null;
  nombre_categoria_anterior?: string | null;
  nombre_categoria_nuevo?: string | null;
  nombre_subcategoria_anterior?: string | null;
  nombre_subcategoria_nuevo?: string | null;
  nombre_ambito_legal_anterior?: string | null;
  nombre_ambito_legal_nuevo?: string | null;
  nombre_solicitante_anterior?: string | null;
  nombre_solicitante_nuevo?: string | null;
  // Nombre del catálogo "padre" (un solo valor, no cambia entre
  // operaciones): categoria->materia, subcategoria->categoria,
  // ambito_legal->subcategoria, caracteristica->tipo_caracteristica,
  // municipio->estado, parroquia->municipio y estado.
  nombre_materia?: string | null;
  nombre_categoria?: string | null;
  nombre_subcategoria?: string | null;
  nombre_tipo_caracteristica?: string | null;
  nombre_estado?: string | null;
  nombre_municipio?: string | null;
  nombre_estado_parroquia?: string | null;
  // FKs propias de 'solicitante' (nivel educativo, condición de trabajo/
  // actividad, estado/municipio/parroquia de residencia) para el diff de
  // 'solicitante-actualizado'.
  nivel_educativo_anterior?: string | null;
  nivel_educativo_nuevo?: string | null;
  condicion_trabajo_anterior?: string | null;
  condicion_trabajo_nuevo?: string | null;
  condicion_actividad_anterior?: string | null;
  condicion_actividad_nuevo?: string | null;
  solicitante_estado_anterior?: string | null;
  solicitante_estado_nuevo?: string | null;
  solicitante_municipio_anterior?: string | null;
  solicitante_municipio_nuevo?: string | null;
  solicitante_parroquia_anterior?: string | null;
  solicitante_parroquia_nuevo?: string | null;
  // Solo entidad='accion': ejecutores del evento gemelo 'accion_ejecutores'
  // de la misma operación (ver get-unified-logs.sql).
  ejecutores_evento?: {
    anteriores?: Array<Record<string, unknown>> | null;
    nuevos?: Array<Record<string, unknown>> | null;
    metadata?: AuditMetadata | null;
  } | null;
  // Personas referenciadas por cédula dentro del evento (usuario afectado,
  // estudiante/profesor, quien subió un soporte...), indexadas por cédula.
  usuarios_ref?: Record<string, {
    nombres: string | null;
    apellidos: string | null;
    correo_electronico: string | null;
    nombre_usuario: string | null;
    tipo_usuario: string | null;
    telefono_celular: string | null;
  }> | null;
  // Nombres adicionales resueltos por entidad (ubicación de un núcleo,
  // materia/categoría de una subcategoría, nivel educativo del jefe...), con
  // las mismas claves que espera la tarjeta.
  nombres_resueltos?: Record<string, string> | null;
  // Solo solicitante eliminado: datos de vivienda y familia/hogar borrados
  // en la misma transacción.
  solicitante_extra?: Record<string, unknown> | null;
  // Solo cita / atencion_cita: personas que atienden la cita borradas
  // ('anteriores') e insertadas ('nuevos') en la misma transacción.
  atenciones_evento?: {
    anteriores: Array<{ cedula: string; nombre: string }>;
    nuevos: Array<{ cedula: string; nombre: string }>;
  } | null;
  // Solo usuario: fila de estudiantes/profesores creada o editada en la misma
  // transacción.
  inscripcion_extra?: {
    entidad: 'estudiante' | 'profesor';
    anteriores: Record<string, unknown> | null;
    nuevos: Record<string, unknown> | null;
  } | null;
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
