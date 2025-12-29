import { pool } from '../pool';
import { loadSQL } from '../sql-loader';
import { QueryResult } from 'pg';
import { z } from 'zod';
import { usuariosQueries } from './usuarios.queries';

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
    /**
     * Obtiene todos los solicitantes
     */
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

    /**
     * Obtiene un solicitante por su cédula
     */
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

    /**
     * Busca usuarios por cédula (búsqueda parcial) - delega a usuariosQueries
     * Útil para búsquedas generales que incluyen usuarios del sistema
     */
    searchUsuariosByCedula: async (cedula: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        nombre_completo: string;
    }>> => {
        return await usuariosQueries.searchByCedula(cedula);
    },

    /**
     * Busca usuarios por cédula excluyendo solicitantes (para recomendaciones)
     */
    searchUsuariosByCedulaExcludeSolicitantes: async (cedula: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        telefono_celular: string;
        correo_electronico: string;
        nombre_completo: string;
    }>> => {
        return await usuariosQueries.searchByCedulaExcludeSolicitantes(cedula);
    },

    /**
     * Busca usuarios por correo electrónico (búsqueda exacta)
     */
    searchUsuariosByEmail: async (email: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        correo_electronico: string;
        nombre_completo: string;
    }>> => {
        return await usuariosQueries.searchByEmail(email);
    },

    /**
     * Actualiza un solicitante con todos los datos completos
     */
    updateComplete: async (data: {
        cedula: string;
        telefonoLocal?: string | null;
        telefonoCelular: string;
        estadoCivil?: string | null;
        concubinato?: boolean | null;
        tiempoEstudio?: string | null;
        idNivelEducativo?: number | null;
        idTrabajo?: number | null;
        idActividad?: number | null;
        idEstado?: number | null;
        numMunicipio?: number | null;
        numParroquia?: number | null;
    }): Promise<any> => {
        const query = loadSQL('solicitantes/update-complete.sql');
        const result: QueryResult = await pool.query(query, [
            data.cedula,
            data.telefonoLocal || null,
            data.telefonoCelular,
            data.estadoCivil || null,
            data.concubinato ?? null,
            data.tiempoEstudio || null,
            data.idNivelEducativo || null,
            data.idTrabajo || null,
            data.idActividad || null,
            data.idEstado || null,
            data.numMunicipio || null,
            data.numParroquia || null,
        ]);
        return result.rows[0];
    },

    /**
     * Verifica si un solicitante existe por su cédula
     */
    checkExists: async (cedula: string): Promise<boolean> => {
        const query = loadSQL('solicitantes/check-exists.sql');
        const result: QueryResult = await pool.query(query, [cedula]);
        return result.rows.length > 0;
    },

    /**
     * Verifica si un correo electrónico ya existe en otro solicitante
     * @param email - Correo electrónico a verificar
     * @returns Objeto con cedula, nombres y apellidos si existe, null si no existe
     */
    checkEmailExists: async (email: string): Promise<{
        cedula: string;
        nombres: string;
        apellidos: string;
    } | null> => {
        const query = loadSQL('solicitantes/check-email-exists.sql');
        const result: QueryResult = await pool.query(query, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    },

    /**
     * Obtiene un solicitante completo por su cédula con todas sus relaciones
     * (núcleo, educación, trabajo, hogar, vivienda, casos)
     */
    getSolicitanteCompleto: async (cedula: string): Promise<any | null> => {
        try {
            // Obtener información completa del solicitante
            const getCompletoSQL = loadSQL('solicitantes/get-by-cedula-completo.sql');
            const resultCompleto: QueryResult = await pool.query(getCompletoSQL, [cedula]);

            if (resultCompleto.rows.length === 0) {
                return null;
            }

            const solicitante = resultCompleto.rows[0];

            // Formatear fechas
            if (solicitante.fecha_nacimiento) {
                solicitante.fecha_nacimiento = solicitante.fecha_nacimiento.toISOString().slice(0, 10);
            }

            // Obtener casos asociados
            try {
                const getCasosSQL = loadSQL('solicitantes/get-casos-by-cedula.sql');
                const resultCasos: QueryResult = await pool.query(getCasosSQL, [cedula]);
                solicitante.casos = resultCasos.rows.map((caso: any) => {
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
                console.error('Error obteniendo casos:', error);
                solicitante.casos = [];
            }

            return solicitante;
        } catch (error) {
            console.error('Error en getSolicitanteCompleto:', error);
            throw error;
        }
    },

    /**
     * Obtiene solicitantes agrupados por género
     * @param fechaInicio - Fecha de inicio del rango (opcional)
     * @param fechaFin - Fecha de fin del rango (opcional)
     */
    getByGenero: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date
    ): Promise<Array<{ genero: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-by-genero.sql');
        const fechaInicioStr = fechaInicio && fechaInicio !== ''
            ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
            : null;
        const fechaFinStr = fechaFin && fechaFin !== ''
            ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
            : null;

        const result: QueryResult = await pool.query(query, [
            fechaInicioStr,
            fechaFinStr,
        ]);
        return result.rows;
    },

    /**
     * Obtiene solicitantes agrupados por parroquia
     * @param fechaInicio - Fecha de inicio del rango (opcional)
     * @param fechaFin - Fecha de fin del rango (opcional)
     */
    getByParroquia: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date
    ): Promise<Array<{ nombre_parroquia: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-by-parroquia.sql');
        const fechaInicioStr = fechaInicio && fechaInicio !== ''
            ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
            : null;
        const fechaFinStr = fechaFin && fechaFin !== ''
            ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
            : null;

        const result: QueryResult = await pool.query(query, [
            fechaInicioStr,
            fechaFinStr,
        ]);
        return result.rows;
    },

    /**
     * Obtiene solicitantes agrupados por estado
     * @param fechaInicio - Fecha de inicio del rango (opcional)
     * @param fechaFin - Fecha de fin del rango (opcional)
     */
    getByEstado: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date
    ): Promise<Array<{ nombre_estado: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-by-estado.sql');
        const fechaInicioStr = fechaInicio && fechaInicio !== ''
            ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
            : null;
        const fechaFinStr = fechaFin && fechaFin !== ''
            ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
            : null;

        const result: QueryResult = await pool.query(query, [
            fechaInicioStr,
            fechaFinStr,
        ]);
        return result.rows;
    },
};

