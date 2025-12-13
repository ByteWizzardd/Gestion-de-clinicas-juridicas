import { casosQueries } from '@/lib/db/queries/casos/casos.queries';
import { asignacionesQueries } from '@/lib/db/queries/asignaciones/asignaciones.queries';
import { cambiosEstatusQueries } from '@/lib/db/queries/cambios-estatus/cambios-estatus.queries';
import { AppError, ValidationError, NotFoundError } from '@/lib/utils/errors';
import { CreateCasoSchema, CreateCasoInput } from '@/lib/validations/casos.schema';
import { ESTATUS_CASO } from '@/lib/constants/status';
import { pool } from '@/lib/db/pool';

/**
 * Servicio para la entidad Casos
 * Contiene la lógica de negocio para el módulo de Listado de Casos
 */
export const casosService = {
    /**
     * Obtiene todos los casos con información enriquecida
     * Incluye nombre del cliente (ya viene del query) y nombre del profesor responsable
     */
    getAllCasos: async () => {
        try {
            // Obtener todos los casos (ya incluye nombre_completo_cliente del JOIN)
            const casos = await casosQueries.getAll();

            // Enriquecer cada caso con el nombre del profesor responsable
            const casosEnriquecidos = await Promise.all(
                casos.map(async (caso) => {
                    // Obtener el profesor responsable activo del caso
                    const profesor = await asignacionesQueries.getProfesorResponsableByCaso(caso.id_caso);

                    return {
                        ...caso,
                        nombre_responsable: profesor ? profesor.nombre_completo_profesor : null,
                    };
                })
            );

            return casosEnriquecidos;
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
     * Crea un nuevo caso
     * Valida los datos y verifica que el cliente exista
     * @param data Datos del caso a crear
     * @param cedulaUsuario Cédula del usuario/estudiante que registra el caso
     */
    createCaso: async (data: unknown, cedulaUsuario: string) => {
        try {
            // Validar datos con Zod
            const validatedData = CreateCasoSchema.parse(data) as CreateCasoInput;

            // Verificar que el cliente existe
            const clienteCheck = await pool.query(
                'SELECT cedula FROM clientes WHERE cedula = $1',
                [validatedData.cedula_cliente]
            );

            if (clienteCheck.rows.length === 0) {
                throw new NotFoundError(`Cliente con cédula ${validatedData.cedula_cliente} no encontrado`);
            }

            // Verificar que el núcleo existe
            const nucleoCheck = await pool.query(
                'SELECT id_nucleo FROM nucleos WHERE id_nucleo = $1',
                [validatedData.id_nucleo]
            );

            if (nucleoCheck.rows.length === 0) {
                throw new NotFoundError(`Núcleo con ID ${validatedData.id_nucleo} no encontrado`);
            }

            // Verificar que el ámbito legal existe
            const ambitoCheck = await pool.query(
                'SELECT id_ambito_legal FROM ambitos_legales WHERE id_ambito_legal = $1',
                [validatedData.id_ambito_legal]
            );

            if (ambitoCheck.rows.length === 0) {
                throw new NotFoundError(`Ámbito legal con ID ${validatedData.id_ambito_legal} no encontrado`);
            }

            // Crear el caso
            // Si fecha_solicitud no se proporciona, se usa CURRENT_DATE en la BD
            const casoData = {
                tramite: validatedData.tramite,
                estatus: validatedData.estatus,
                observaciones: validatedData.observaciones || undefined,
                cedula_cliente: validatedData.cedula_cliente,
                id_nucleo: validatedData.id_nucleo,
                id_ambito_legal: validatedData.id_ambito_legal,
                id_expediente: validatedData.id_expediente || undefined,
                fecha_solicitud: validatedData.fecha_solicitud || undefined,
            };
            
            const nuevoCaso = await casosQueries.create(casoData);

            // Registrar el cambio de estatus en la tabla cambios_estatus
            // El estatus inicial será el mismo que se asignó al caso
            await cambiosEstatusQueries.create(
                cedulaUsuario,
                nuevoCaso.id_caso,
                validatedData.estatus
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
};
