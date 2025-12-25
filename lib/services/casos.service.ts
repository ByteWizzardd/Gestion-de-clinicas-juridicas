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
            };
            
            const nuevoCaso = await casosQueries.create(casoData);

            // Registrar el cambio de estatus en la tabla cambio_estatus
            // El estatus inicial será el mismo que se asignó al caso
            await cambiosEstatusQueries.create(
                nuevoCaso.id_caso,
                validatedData.estatus,
                cedulaUsuario
            );

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
            const [
                beneficiarios,
                equipo,
                acciones,
                citas,
                cambiosEstatus,
                soportes
            ] = await Promise.all([
                beneficiariosQueries.getByCaso(idCaso),
                asignacionesQueries.getEquipoByCaso(idCaso),
                accionesQueries.getByCaso(idCaso),
                citasQueries.getByCaso(idCaso),
                cambiosEstatusQueries.getByCaso(idCaso),
                soportesQueries.getByCaso(idCaso)
            ]);

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
            throw new AppError(
                'Error al obtener el caso completo',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },
};

