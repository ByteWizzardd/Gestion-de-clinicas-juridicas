import { loadSQL } from '../../sql-loader';
import { pool } from '../../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Asignaciones
 * Todas las queries SQL están en database/queries/asignaciones/
 */
export const asignacionesQueries = {
    /**
     * Obtiene el profesor responsable activo de un caso específico
     * Retorna el primer profesor con asignación activa o null si no hay ninguno
     */
    getProfesorResponsableByCaso: async (idCaso: number): Promise<{ cedula_profesor: string; nombre_completo_profesor: string } | null> => {
        const query = loadSQL('asignaciones/get-profesores-responsables-by-caso.sql');
        const result: QueryResult = await pool.query(query, [idCaso]);
        return result.rows[0] || null;
    },
};
