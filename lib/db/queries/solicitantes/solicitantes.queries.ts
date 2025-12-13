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
    
    getSolicitanteCompleto: async (cedula: string): Promise<any | null> => {
        try {
            // Obtener información completa del cliente
            const getCompletoSQL = loadSQL("solicitantes/get-by-cedula-completo.sql");
            const resultCompleto: QueryResult = await pool.query(getCompletoSQL, [cedula]);
            
            if (resultCompleto.rows.length === 0) {
                return null;
            }
            
            const cliente = resultCompleto.rows[0];
            
            // Formatear fechas
            if (cliente.fecha_nacimiento) {
                cliente.fecha_nacimiento = cliente.fecha_nacimiento.toISOString().slice(0, 10);
            }
            
            // Obtener artefactos domésticos (solo si tiene hogar)
            if (cliente.id_hogar) {
                try {
                    const getArtefactosSQL = loadSQL("solicitantes/get-artefactos-by-cedula.sql");
                    const resultArtefactos: QueryResult = await pool.query(getArtefactosSQL, [cedula]);
                    cliente.artefactos = resultArtefactos.rows.map((row: { artefacto: string }) => row.artefacto);
                } catch (error) {
                    console.error("Error obteniendo artefactos:", error);
                    cliente.artefactos = [];
                }
            } else {
                cliente.artefactos = [];
            }
            
            // Obtener casos asociados
            try {
                const getCasosSQL = loadSQL("solicitantes/get-casos-by-cedula.sql");
                const resultCasos: QueryResult = await pool.query(getCasosSQL, [cedula]);
                cliente.casos = resultCasos.rows.map((caso: any) => {
                    // Formatear fechas de casos
                    if (caso.fecha_solicitud) {
                        caso.fecha_solicitud = caso.fecha_solicitud.toISOString().slice(0, 10);
                    }
                    if (caso.fecha_inicio_caso) {
                        caso.fecha_inicio_caso = caso.fecha_inicio_caso.toISOString().slice(0, 10);
                    }
                    if (caso.fecha_fin_caso) {
                        caso.fecha_fin_caso = caso.fecha_fin_caso.toISOString().slice(0, 10);
                    }
                    return caso;
                });
            } catch (error) {
                console.error("Error obteniendo casos:", error);
                cliente.casos = [];
            }
            
            return cliente;
        } catch (error) {
            console.error("Error en getSolicitanteCompleto:", error);
            throw error;
        }
    },
};