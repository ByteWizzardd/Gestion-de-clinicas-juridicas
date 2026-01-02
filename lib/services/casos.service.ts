import { casosQueries } from '@/lib/db/queries/casos.queries';
import { cambiosEstatusQueries } from '@/lib/db/queries/cambios-estatus.queries';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { nucleosQueries } from '@/lib/db/queries/nucleos.queries';
import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales.queries';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { accionesQueries } from '@/lib/db/queries/acciones.queries';
import { citasQueries } from '@/lib/db/queries/citas.queries';
import { soportesQueries } from '@/lib/db/queries/soportes.queries';
import { asignacionesQueries } from '@/lib/db/queries/asignaciones.queries';
import { AppError, ValidationError, NotFoundError } from '@/lib/utils/errors';
import { CreateCasoSchema, CreateCasoInput } from '@/lib/validations/casos.schema';
import { ESTATUS_CASO } from '@/lib/constants/status';
import { readFileSync } from 'fs';
import { join } from 'path';

const getCasoByIdQuery = readFileSync(
    join(process.cwd(), 'database/queries/casos/get-by-id.sql'),
    'utf8'
);

const getCaseIdsQuery = readFileSync(
    join(process.cwd(), 'database/queries/casos/get-by-id-case.sql'),
    'utf8'
);

/**
 * Servicio para la entidad Casos
 * Contiene la lógica de negocio para el módulo de Listado de Casos
 */
export const casosService = {
    /**
     * Obtiene todos los casos con información enriquecida
     * Incluye nombre del solicitante y nombre del profesor responsable
     * OPTIMIZADO: Usa una sola query con JOIN LATERAL en lugar de N+1 queries
     */
    getAllCasos: async () => {
        try {
            // Usar la query optimizada que incluye el profesor responsable en un JOIN
            const casos = await casosQueries.getAllWithProfesor();

            // El nombre_responsable ya viene del JOIN, solo asegurar que sea null si está vacío
            return casos.map(caso => ({
                ...caso,
                nombre_responsable: caso.nombre_responsable || null,
            }));
        } catch (error) {
            throw new AppError(
                'Error al obtener los casos',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },

    /**
     * Obtiene el siguiente número de caso
     * Retorna solo el número (sin prefijo)
     */
    getNextCaseNumber: async (): Promise<number> => {
        try {
            const lastId = await casosQueries.getLastId();
            const nextId = lastId + 1;
            return nextId;
        } catch (error) {
            throw new AppError(
                'Error al obtener el siguiente número de caso',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },

    /**
     * Crea un nuevo caso asociado a un solicitante
     * Valida los datos y verifica que el solicitante exista
     * @param data Datos del caso a crear (incluye cedula del solicitante)
     * @param cedulaUsuario Cédula del usuario (estudiante/profesor) que registra el caso
     */
    createCaso: async (data: unknown, cedulaUsuario: string) => {
        try {
            // Validar datos con Zod
            const validatedData = CreateCasoSchema.parse(data) as CreateCasoInput;

            // Verificar que el solicitante existe
            const solicitanteExists = await solicitantesQueries.getSolicitanteById(validatedData.cedula);
            if (!solicitanteExists) {
                throw new NotFoundError(`Solicitante con cédula ${validatedData.cedula} no encontrado`);
            }

            // Verificar que el núcleo existe
            const nucleoExists = await nucleosQueries.checkExists(validatedData.id_nucleo);
            if (!nucleoExists) {
                throw new NotFoundError(`Núcleo con ID ${validatedData.id_nucleo} no encontrado`);
            }

            // Verificar que el ámbito legal existe (usando la clave compuesta)
            const ambitoExists = await ambitosLegalesQueries.checkExists(
                validatedData.id_materia,
                validatedData.num_categoria,
                validatedData.num_subcategoria,
                validatedData.num_ambito_legal
            );
            if (!ambitoExists) {
                throw new NotFoundError(`Ámbito legal no encontrado`);
            }

            // Crear el caso
            // Si fecha_solicitud no se proporciona, se usa CURRENT_DATE en la BD
            // Si no hay categoría o subcategoría, usar 0 en lugar de null/undefined
            const casoData = {
                tramite: validatedData.tramite,
                observaciones: validatedData.observaciones || undefined,
                cedula: validatedData.cedula,
                id_nucleo: validatedData.id_nucleo,
                id_materia: validatedData.id_materia,
                num_categoria: validatedData.num_categoria ?? 0,
                num_subcategoria: validatedData.num_subcategoria ?? 0,
                num_ambito_legal: validatedData.num_ambito_legal,
                fecha_solicitud: validatedData.fecha_solicitud || undefined,
                fecha_inicio_caso: validatedData.fecha_inicio_caso,
                cedulaUsuarioRegistra: cedulaUsuario, // Pasar la cédula del usuario que registra (para variable de sesión del trigger)
            };

            // Crear el caso - el trigger automáticamente creará el cambio_estatus inicial
            const nuevoCaso = await casosQueries.create(casoData);

            // El cambio de estatus se crea automáticamente mediante el trigger
            // con estatus 'Asesoría' y motivo 'Registro del caso'

            return nuevoCaso;
        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }

            // Si es un error de Zod, convertirlo a ValidationError
            if (error && typeof error === 'object' && 'issues' in error) {
                const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
                const fields: Record<string, string[]> = {};

                zodError.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    if (!fields[path]) {
                        fields[path] = [];
                    }
                    fields[path].push(issue.message);
                });

                throw new ValidationError('Error de validación', fields);
            }

            throw new AppError(
                'Error al crear el caso',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },

    /**
     * Obtiene un caso por ID con toda su información relacionada
     * Incluye: caso, solicitante, beneficiarios, equipo, acciones, citas, cambios de estatus, soportes
     */
    getCasoByIdCompleto: async (idCaso: number) => {
        try {
            // Obtener el caso base
            const caso = await casosQueries.getById(idCaso);
            if (!caso) {
                throw new NotFoundError(`Caso con ID ${idCaso} no encontrado`);
            }

            // Obtener información relacionada en paralelo
            // Usar Promise.allSettled para capturar errores individuales
            const results = await Promise.allSettled([
                beneficiariosQueries.getByCaso(idCaso),
                asignacionesQueries.getEquipoByCaso(idCaso),
                accionesQueries.getByCaso(idCaso),
                citasQueries.getByCaso(idCaso),
                cambiosEstatusQueries.getByCaso(idCaso),
                soportesQueries.getByCaso(idCaso)
            ]);

            const queryNames = ['beneficiarios', 'equipo', 'acciones', 'citas', 'cambiosEstatus', 'soportes'];
            const errors: string[] = [];

            // Procesar resultados y capturar errores
            const beneficiarios = results[0].status === 'fulfilled' ? results[0].value : (errors.push(`${queryNames[0]}: ${results[0].reason instanceof Error ? results[0].reason.message : String(results[0].reason)}`), []);
            const equipo = results[1].status === 'fulfilled' ? results[1].value : (errors.push(`${queryNames[1]}: ${results[1].reason instanceof Error ? results[1].reason.message : String(results[1].reason)}`), []);
            const acciones = results[2].status === 'fulfilled' ? results[2].value : (errors.push(`${queryNames[2]}: ${results[2].reason instanceof Error ? results[2].reason.message : String(results[2].reason)}`), []);
            const citas = results[3].status === 'fulfilled' ? results[3].value : (errors.push(`${queryNames[3]}: ${results[3].reason instanceof Error ? results[3].reason.message : String(results[3].reason)}`), []);
            const cambiosEstatus = results[4].status === 'fulfilled' ? results[4].value : (errors.push(`${queryNames[4]}: ${results[4].reason instanceof Error ? results[4].reason.message : String(results[4].reason)}`), []);
            const soportes = results[5].status === 'fulfilled' ? results[5].value : (errors.push(`${queryNames[5]}: ${results[5].reason instanceof Error ? results[5].reason.message : String(results[5].reason)}`), []);

            // Si hay errores, lanzar con información detallada
            if (errors.length > 0) {
                const errorDetails = errors.join('; ');
                console.error(`[getCasoByIdCompleto] Errores en queries para caso ${idCaso}:`, errorDetails);
                throw new AppError(
                    `Error al obtener información relacionada del caso: ${errorDetails}`,
                    500,
                    'CASO_ERROR'
                );
            }

            return {
                ...caso,
                beneficiarios,
                equipo,
                acciones,
                citas,
                cambiosEstatus,
                soportes
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            if (error instanceof AppError) {
                throw error;
            }
            const originalMessage = error instanceof Error ? error.message : 'Error desconocido';
            throw new AppError(
                `Error al obtener el caso completo: ${originalMessage}`,
                500,
                'CASO_ERROR'
            );
        }
    },

    /**
     * Obtiene un caso por ID (versión simple, sin información relacionada)
     */
    getCasoById: async (idCaso: number): Promise<unknown> => {
        return await casosQueries.getById(idCaso);
    },

    /**
     * Obtiene todos los IDs de los casos
     */
    getAllCaseIds: async (): Promise<number[]> => {
        const ids = await casosQueries.getAllIds();
        return ids;
    },
};

