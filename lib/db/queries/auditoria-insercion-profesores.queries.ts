import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const auditoriaInsercionProfesoresQueries = {
    getAll: async (filters?: {
        fechaInicio?: string;
        fechaFin?: string;
        idUsuario?: string;
        busqueda?: string;
        orden?: 'asc' | 'desc';
    }) => {
        const query = loadSQL('auditoria-insercion-profesores/get-all.sql');
        const result: QueryResult = await pool.query(query, [
            filters?.fechaInicio || null,
            filters?.fechaFin || null,
            filters?.idUsuario || null,
            filters?.busqueda || null,
            filters?.orden || 'desc',
        ]);

        return result.rows.map(row => ({
            ...row,
            foto_perfil_usuario_creo: row.foto_perfil_usuario_creo
                ? `data:image/jpeg;base64,${(row.foto_perfil_usuario_creo as Buffer).toString('base64')}`
                : null,
        }));
    },

    getCount: async (): Promise<number> => {
        const query = loadSQL('auditoria-insercion-profesores/get-count.sql');
        const result: QueryResult = await pool.query(query);
        return parseInt(result.rows[0].total, 10);
    },
};
