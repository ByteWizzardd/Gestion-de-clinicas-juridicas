import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const auditoriaInsercionEstudiantesQueries = {
    getAll: async (filters?: {
        fechaInicio?: string;
        fechaFin?: string;
        idUsuario?: string;
        busqueda?: string;
        orden?: 'asc' | 'desc';
    }) => {
        // Reutilizaremos un archivo SQL similar al de usuarios o haremos build dinámico momentáneo
        // Por buena práctica, deberíamos tener un SQL file. 
        // Para simplificar este paso, escribiré la query aquí o crearé el archivo SQL.
        // Voy a asumir que crearé el archivo SQL correspondiente.
        const query = loadSQL('auditoria-insercion-estudiantes/get-all.sql');
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
};
