import { pool } from '../pool';
import { logger } from '@/lib/utils/logger';
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
    estado_civil: z.string().nullable().optional(),
    nacionalidad: z.string().nullable().optional(),
});

export type Solicitante = z.infer<typeof getAllSolicitantes>;

export type SolicitanteCompletoCaso = {
    id_caso: number;
    id?: number;
    fecha_solicitud?: Date | string | null;
    fecha_solicitud_str?: string;
    fecha_inicio_caso?: Date | string | null;
    fecha_inicio_caso_str?: string;
    fecha_fin_caso?: Date | string | null;
    fecha_fin_caso_str?: string;
    tramite?: string | null;
    estatus?: string | null;
    cant_beneficiarios?: number | null;
    observaciones?: string | null;
    nombre_nucleo?: string | null;
    nombre_materia?: string | null;
    nombre_categoria?: string | null;
    nombre_subcategoria?: string | null;
} & Record<string, unknown>;

export type SolicitanteCompleto = {
    cedula: string;
    nombres?: string | null;
    apellidos?: string | null;
    telefono_local?: string | null;
    telefono_celular?: string | null;
    correo_electronico?: string | null;
    fecha_nacimiento?: string | null;
    informacion_socioeconomica?: Record<string, unknown> | null;
    informacion_ubicacion_vivienda?: Record<string, unknown> | null;
    casos: SolicitanteCompletoCaso[];
} & Record<string, unknown>;

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
    getSolicitanteById: async (cedula: string): Promise<Record<string, unknown> | null> => {
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
        return row as Record<string, unknown>;
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
        return await usuariosQueries.searchByCedula(cedula, true);
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
        direccionHabitacion?: string | null;
    }): Promise<unknown> => {
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
            data.direccionHabitacion || null,
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
     * @param excludeCedula - Cédula a excluir de la verificación (opcional)
     * @returns Objeto con cedula, nombres y apellidos si existe, null si no existe
     */
    checkEmailExists: async (email: string, excludeCedula?: string): Promise<{
        cedula: string;
        nombres: string;
        apellidos: string;
    } | null> => {
        const query = loadSQL('solicitantes/check-email-exists.sql');
        const result: QueryResult = await pool.query(query, [email, excludeCedula || null]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    },

    /**
     * Obtiene un solicitante completo por su cédula con todas sus relaciones
     * (núcleo, educación, trabajo, hogar, vivienda, casos)
     */
    getSolicitanteCompleto: async (cedula: string): Promise<SolicitanteCompleto | null> => {
        try {
            // Obtener información completa del solicitante
            const getCompletoSQL = loadSQL('solicitantes/get-by-cedula-completo.sql');
            const resultCompleto: QueryResult = await pool.query(getCompletoSQL, [cedula]);

            if (resultCompleto.rows.length === 0) {
                return null;
            }

            const solicitante = resultCompleto.rows[0] as SolicitanteCompleto;
            // Garantizar que exista la propiedad para el tipado y evitar undefined.
            solicitante.casos = [];

            // Formatear fechas
            const rawFechaNacimiento = (solicitante as unknown as { fecha_nacimiento?: unknown }).fecha_nacimiento;
            if (rawFechaNacimiento instanceof Date) {
                solicitante.fecha_nacimiento = rawFechaNacimiento.toISOString().slice(0, 10);
            }

            // Obtener casos asociados
            try {
                const getCasosSQL = loadSQL('solicitantes/get-casos-by-cedula.sql');
                const resultCasos: QueryResult = await pool.query(getCasosSQL, [cedula]);
                solicitante.casos = (resultCasos.rows as SolicitanteCompletoCaso[]).map((c) => {
                    // Formatear fechas de casos
                    if (c.fecha_solicitud instanceof Date) {
                        c.fecha_solicitud_str = c.fecha_solicitud.toISOString().slice(0, 10);
                    }
                    if (c.fecha_inicio_caso instanceof Date) {
                        c.fecha_inicio_caso_str = c.fecha_inicio_caso.toISOString().slice(0, 10);
                    }
                    if (c.fecha_fin_caso instanceof Date) {
                        c.fecha_fin_caso_str = c.fecha_fin_caso.toISOString().slice(0, 10);
                    }
                    return c;
                });
            } catch (error) {
                logger.error('Error obteniendo casos:', error);
                solicitante.casos = [];
            }

            return solicitante;
        } catch (error) {
            logger.error('Error en getSolicitanteCompleto:', error);
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
        fechaFin?: string | Date,
        term?: string
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
            term || null,
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
        fechaFin?: string | Date,
        term?: string
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
            term || null,
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
        fechaFin?: string | Date,
        term?: string
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
            term || null,
        ]);
        return result.rows;
    },

    getByTipoVivienda: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ tipo_vivienda: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-tipo-vivienda.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionGenero: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ genero: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-genero.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionEdad: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ rango_edad: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-edad.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionEstadoCivil: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ estado_civil: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-estado-civil.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionNivelEducativo: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ nivel_educativo: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-nivel-educativo.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionCondicionTrabajo: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ condicion_trabajo: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-condicion-trabajo.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionCondicionActividad: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ condicion_actividad: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-condicion-actividad.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },
    getDistribucionLaboralFusionada: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ categoria: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-laboral-fusionada.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionIngresos: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ rango_ingresos: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-ingresos.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionTamanoHogar: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ tamano_hogar: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-tamano-hogar.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionTrabajadoresHogar: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ trabajadores_hogar: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-trabajadores-hogar.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionNinosHogar: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ ninos_hogar: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-ninos-hogar.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },
    getDistribucionHabitaciones: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ cant_habitaciones: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-habitaciones.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },
    getDistribucionBanos: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ cant_banos: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-banos.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },
    getDistribucionCaracteristicasVivienda: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{
        nombre_tipo_caracteristica: string;
        caracteristica: string;
        cantidad_solicitantes: number
    }>> => {
        const query = loadSQL('solicitantes/get-distribucion-caracteristicas-vivienda.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    getDistribucionDependientes: async (
        fechaInicio?: string | Date,
        fechaFin?: string | Date,
        term?: string
    ): Promise<Array<{ cantidad_dependientes: string; cantidad_solicitantes: number }>> => {
        const query = loadSQL('solicitantes/get-distribucion-dependientes.sql');
        const { start, end } = formatDates(fechaInicio, fechaFin);
        const result: QueryResult = await pool.query(query, [start, end, term || null]);
        return result.rows;
    },

    deleteById: async (cedula: string): Promise<void> => {
        const query = loadSQL('solicitantes/delete-by-id.sql');
        await pool.query(query, [cedula]);
    },

    getsNacionality: async (nacionalidad: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        nacionalidad: string;
    }>> => {
        const query = loadSQL('solicitantes/get-nacionalidad.sql');
        const result: QueryResult = await pool.query(query, [nacionalidad]);
        return result.rows;
    },

    getsEstadoCivil: async (estadoCivil: string): Promise<Array<{
        cedula: string;
        nombres: string;
        apellidos: string;
        estado_civil: string;
    }>> => {
        const query = loadSQL('solicitantes/get-estado-civil.sql');
        const result: QueryResult = await pool.query(query, [estadoCivil]);
        return result.rows;
    },
    /**
     * Obtiene solicitantes filtrados por núcleo (nombre de núcleo)
     * Devuelve todos los campos del solicitante (s.*) + campos calculados del query.
     */
    getByNucleo: async (nombreNucleo: string): Promise<Array<Record<string, unknown>>> => {
        const query = loadSQL('solicitantes/get-by-nucleo.sql');
        const result: QueryResult = await pool.query(query, [nombreNucleo]);

        const rows = result.rows.map((rowUnknown: unknown) => {
            const row = rowUnknown as Record<string, unknown>;
            const nombres = typeof row.nombres === 'string' ? row.nombres : null;
            const apellidos = typeof row.apellidos === 'string' ? row.apellidos : null;

            const mapped: Record<string, unknown> = {
                ...row,
                nombre_completo: nombres && apellidos ? `${nombres} ${apellidos}` : null,
            };

            const fechaSolicitud = row.fecha_solicitud;
            if (fechaSolicitud instanceof Date) {
                mapped.fecha_solicitud = fechaSolicitud.toISOString().slice(0, 10);
            }

            const fechaNacimiento = row.fecha_nacimiento;
            if (fechaNacimiento instanceof Date) {
                mapped.fecha_nacimiento = fechaNacimiento.toISOString().slice(0, 10);
            }

            return mapped;
        });

        return rows;
    },

    /**
     * Obtiene solicitantes filtrados por estado civil
     * Devuelve todos los campos del solicitante (s.*) + campos calculados del query.
     */
    getByEstadoCivil: async (estadoCivil: string): Promise<Array<Record<string, unknown>>> => {
        const query = loadSQL('solicitantes/get-by-estado-civil.sql');
        const result: QueryResult = await pool.query(query, [estadoCivil]);

        const rows = result.rows.map((rowUnknown: unknown) => {
            const row = rowUnknown as Record<string, unknown>;
            const nombres = typeof row.nombres === 'string' ? row.nombres : null;
            const apellidos = typeof row.apellidos === 'string' ? row.apellidos : null;

            const mapped: Record<string, unknown> = {
                ...row,
                nombre_completo: nombres && apellidos ? `${nombres} ${apellidos}` : null,
            };

            const fechaSolicitud = row.fecha_solicitud;
            if (fechaSolicitud instanceof Date) {
                mapped.fecha_solicitud = fechaSolicitud.toISOString().slice(0, 10);
            }

            const fechaNacimiento = row.fecha_nacimiento;
            if (fechaNacimiento instanceof Date) {
                mapped.fecha_nacimiento = fechaNacimiento.toISOString().slice(0, 10);
            }

            return mapped;
        });

        return rows;
    },

    /**
     * Obtiene solicitantes filtrados por nacionalidad
     * Devuelve todos los campos del solicitante (s.*) + campos calculados del query.
     */
    getByNacionalidad: async (nacionalidad: string): Promise<Array<Record<string, unknown>>> => {
        const query = loadSQL('solicitantes/get-by-nacionalidad.sql');
        const result: QueryResult = await pool.query(query, [nacionalidad]);

        const rows = result.rows.map((rowUnknown: unknown) => {
            const row = rowUnknown as Record<string, unknown>;
            const nombres = typeof row.nombres === 'string' ? row.nombres : null;
            const apellidos = typeof row.apellidos === 'string' ? row.apellidos : null;

            const mapped: Record<string, unknown> = {
                ...row,
                nombre_completo: nombres && apellidos ? `${nombres} ${apellidos}` : null,
            };

            const fechaSolicitud = row.fecha_solicitud;
            if (fechaSolicitud instanceof Date) {
                mapped.fecha_solicitud = fechaSolicitud.toISOString().slice(0, 10);
            }

            const fechaNacimiento = row.fecha_nacimiento;
            if (fechaNacimiento instanceof Date) {
                mapped.fecha_nacimiento = fechaNacimiento.toISOString().slice(0, 10);
            }

            return mapped;
        });

        return rows;
    },

    /**
     * Actualiza nombres, apellidos, fecha de nacimiento y sexo de un solicitante
     */
    updateBasicInfo: async (cedula: string, nombres: string, apellidos: string, fechaNacimiento: string | Date, sexo: string, cedulaActor: string): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SELECT set_config('app.usuario_actualiza_solicitante', $1, true)`, [cedulaActor]);
            const fecha = typeof fechaNacimiento === 'string' ? fechaNacimiento : fechaNacimiento.toISOString().split('T')[0];
            await client.query(
                `UPDATE solicitantes SET nombres = $2, apellidos = $3, fecha_nacimiento = $4, sexo = $5 WHERE cedula = $1`,
                [cedula, nombres, apellidos, fecha, sexo]
            );
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    /**
     * Actualiza información de contacto (nombres, apellidos, email, telefono)
     */
    updateContactInfo: async (cedula: string, nombres: string, apellidos: string, correo: string, telefono: string, cedulaActor: string): Promise<void> => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SELECT set_config('app.usuario_actualiza_solicitante', $1, true)`, [cedulaActor]);
            await client.query(
                `UPDATE solicitantes SET nombres = $2, apellidos = $3, correo_electronico = $4, telefono_celular = $5 WHERE cedula = $1`,
                [cedula, nombres, apellidos, correo, telefono]
            );
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};

/**
 * Función auxiliar para formatear fechas
 */
function formatDates(fechaInicio?: string | Date, fechaFin?: string | Date) {
    const start = fechaInicio && fechaInicio !== ''
        ? (typeof fechaInicio === 'string' ? fechaInicio : fechaInicio.toISOString().split('T')[0])
        : null;
    const end = fechaFin && fechaFin !== ''
        ? (typeof fechaFin === 'string' ? fechaFin : fechaFin.toISOString().split('T')[0])
        : null;
    return { start, end };
}

