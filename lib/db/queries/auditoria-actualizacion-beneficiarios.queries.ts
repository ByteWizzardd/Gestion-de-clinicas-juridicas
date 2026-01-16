import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

export const auditoriaActualizacionBeneficiariosQueries = {
    getCount: async (): Promise<number> => {
        const result = await pool.query('SELECT COUNT(*) FROM auditoria_actualizacion_beneficiarios');
        return parseInt(result.rows[0].count, 10);
    },

    getAll: async (): Promise<Array<{
        id: number;
        num_beneficiario: number;
        id_caso: number;
        numero_expediente?: string;

        cedula_anterior: string | null;
        nombres_anterior: string;
        apellidos_anterior: string;
        fecha_nacimiento_anterior: Date | string;
        sexo_anterior: string;
        tipo_beneficiario_anterior: string;
        parentesco_anterior: string;

        cedula_nuevo: string | null;
        nombres_nuevo: string;
        apellidos_nuevo: string;
        fecha_nacimiento_nuevo: Date | string;
        sexo_nuevo: string;
        tipo_beneficiario_nuevo: string;
        parentesco_nuevo: string;

        id_usuario_actualizo: string | null;
        nombre_usuario: string | null;
        apellido_usuario: string | null;
        usuario_nombre_completo: string | null;
        fecha_actualizacion: Date;
    }>> => {
        const query = loadSQL('auditoria-actualizacion-beneficiarios/get-all.sql');
        const result: QueryResult = await pool.query(query);
        return result.rows.map(row => ({
            ...row,
            fecha_nacimiento_anterior: row.fecha_nacimiento_anterior instanceof Date
                ? row.fecha_nacimiento_anterior.toISOString().split('T')[0]
                : row.fecha_nacimiento_anterior,
            fecha_nacimiento_nuevo: row.fecha_nacimiento_nuevo instanceof Date
                ? row.fecha_nacimiento_nuevo.toISOString().split('T')[0]
                : row.fecha_nacimiento_nuevo
        }));
    },
};
