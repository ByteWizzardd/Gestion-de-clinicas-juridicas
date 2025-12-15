import { pool } from '../../pool';
import { loadSQL } from '../../sql-loader';
import { QueryResult } from 'pg';
import { z } from 'zod';

// Esquema Zod para validar los resultados de solicitantes
export const getAllSolicitantes = z.object({
    cedula: z.string(),
    nombre_completo: z.string(),
    telefono_celular: z.string(),
    nucleo: z.string().nullable(),
    fecha_solicitud: z.string().nullable(),
});

export type Solicitante = z.infer<typeof getAllSolicitantes>;

export const solicitantesQueries = {
    getAllSolicitantes: async (): Promise<Solicitante[]> => {
        const getSolicitantesSQL = loadSQL("solicitantes/get-solicitantes.sql");
        const result: QueryResult = await pool.query(getSolicitantesSQL);
        // Unir nombres y apellidos en nombre_completo
        type DBRow = {
            cedula: string;
            nombres: string;
            apellidos: string;
            telefono_celular: string;
            nucleo: string | null;
            fecha_solicitud: Date | null;
        };
        const rowsWithNombreCompleto = result.rows.map((row: DBRow) => ({
            ...row,
            nombre_completo: `${row.nombres} ${row.apellidos}`,
            fecha_solicitud: row.fecha_solicitud
                ? row.fecha_solicitud.toISOString().slice(0, 10)
                : null,
        }));
        const validatedData = getAllSolicitantes.array().parse(rowsWithNombreCompleto);
        return validatedData;
    },
    
    getSolicitanteById: async (cedula: string): Promise<any | null> => {
        const getSolicitanteSQL = loadSQL("solicitantes/get-by-id.sql");
        const result: QueryResult = await pool.query(getSolicitanteSQL, [cedula]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        // Formatear fecha_nacimiento
        if (row.fecha_nacimiento) {
            row.fecha_nacimiento = row.fecha_nacimiento.toISOString().slice(0, 10);
        }
        return row;
    },

    /**
     * Busca solicitantes por cédula (búsqueda parcial)
     * Un solicitante es un cliente que tiene al menos un caso registrado
     */
    searchByCedula: async (cedula: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        nombre_completo: string;
    }>> => {
        const query = loadSQL('solicitantes/search-by-cedula.sql');
        const result: QueryResult = await pool.query(query, [cedula]);
        return result.rows;
    },
};