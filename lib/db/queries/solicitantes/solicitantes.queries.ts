import { pool } from '../../pool';
import { loadSQL } from '../../sql-loader';
import { QueryResult } from 'pg';
import { z } from 'zod';

// Esquema Zod para validar los resultados de solicitantes
export const getAllSolicitantesSchema = z.object({
    cedula: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    telefono_celular: z.string(),
    fecha_solicitud: z.string().nullable(),
});

export type Solicitante = z.infer<typeof getAllSolicitantesSchema>;

export const solicitantesQueries = {
    getAllSolicitantes: async (): Promise<Solicitante[]> => {
        const getSolicitantesSQL = loadSQL("clientes/get-solicitantes.sql");
        const result: QueryResult = await pool.query(getSolicitantesSQL);
        const validatedData = getAllSolicitantesSchema.array().parse(result.rows);
        return validatedData;
    },
};