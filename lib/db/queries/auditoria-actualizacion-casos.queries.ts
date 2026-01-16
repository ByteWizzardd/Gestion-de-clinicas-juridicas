import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad AuditoriaActualizacionCasos
 * Todas las queries SQL están en database/queries/auditoria-actualizacion-casos/
 * Ahora incluye también los cambios de estatus de la tabla cambio_estatus
 */
export const auditoriaActualizacionCasosQueries = {
  /**
   * Obtiene todas las actualizaciones de casos con filtros opcionales
   * Incluye tanto cambios de campos como cambios de estatus
   */
  getAll: async (filters?: {
    fechaInicio?: string;
    fechaFin?: string;
    idCaso?: number;
    idUsuario?: string;
    orden?: 'asc' | 'desc';
  }): Promise<Array<{
    id: number;
    id_caso: number | null;
    tipo_cambio: 'actualizacion_campos' | 'cambio_estatus';
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
    fecha_actualizacion: string;
    id_usuario_actualizo: string | null;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-casos/get-all.sql');
    const result: QueryResult = await pool.query(query, [
      filters?.fechaInicio || null,
      filters?.fechaFin || null,
      filters?.idCaso || null,
      filters?.idUsuario || null,
      filters?.orden || 'desc',
    ]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene todas las actualizaciones de un caso específico
   * Incluye tanto cambios de campos como cambios de estatus
   */
  getByCaso: async (idCaso: number): Promise<Array<{
    id: number;
    id_caso: number | null;
    tipo_cambio: 'actualizacion_campos' | 'cambio_estatus';
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
    fecha_actualizacion: string;
    id_usuario_actualizo: string | null;
    nombres_usuario_actualizo: string | null;
    apellidos_usuario_actualizo: string | null;
    nombre_completo_usuario_actualizo: string | null;
    foto_perfil_usuario_actualizo: string | null;
  }>> => {
    const query = loadSQL('auditoria-actualizacion-casos/get-by-caso.sql');
    const result: QueryResult = await pool.query(query, [idCaso]);
    // Convertir foto_perfil de Buffer a base64
    return result.rows.map(row => ({
      ...row,
      foto_perfil_usuario_actualizo: row.foto_perfil_usuario_actualizo
        ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_actualizo as Buffer).toString('base64')}`
        : null,
    }));
  },

  /**
   * Obtiene el conteo total de actualizaciones de casos
   * Incluye tanto cambios de campos como cambios de estatus
   */
  getCount: async (): Promise<number> => {
    const query = loadSQL('auditoria-actualizacion-casos/get-count.sql');
    const result: QueryResult = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  },
};

