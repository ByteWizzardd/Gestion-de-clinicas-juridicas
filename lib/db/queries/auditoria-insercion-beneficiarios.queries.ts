import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const auditoriaInsercionBeneficiariosQueries = {
    getCount: async (): Promise<number> => {
        const result = await pool.query('SELECT COUNT(*) FROM auditoria_insercion_beneficiarios');
        return parseInt(result.rows[0].count, 10);
    },

    getAll: async (filters?: {
        fechaInicio?: string;
        fechaFin?: string;
        idUsuario?: string;
        busqueda?: string;
        orden?: 'asc' | 'desc';
    }): Promise<Array<{
        id: number;
        num_beneficiario: number;
        id_caso: number;
        numero_expediente?: string;
        cedula: string | null;
        nombres: string;
        apellidos: string;
        fecha_nacimiento: Date | string;
        sexo: string;
        tipo_beneficiario: string;
        parentesco: string;
        id_usuario_registro: string | null;
        nombre_usuario: string | null;
        apellido_usuario: string | null;
        usuario_nombre_completo: string | null;
        fecha_registro: Date;
    }>> => {
        const query = loadSQL('auditoria-insercion-beneficiarios/get-all.sql');
        const result: QueryResult = await pool.query(query, [
            filters?.fechaInicio || null,
            filters?.fechaFin || null,
            filters?.idUsuario || null,
            filters?.busqueda || null,
            filters?.orden || 'desc',
        ]);
        return result.rows.map(row => ({
            ...row,
            fecha_nacimiento: row.fecha_nacimiento instanceof Date
                ? row.fecha_nacimiento.toISOString().split('T')[0]
                : row.fecha_nacimiento
        }));
    },

};
