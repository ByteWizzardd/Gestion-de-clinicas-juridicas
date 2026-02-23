import { casosQueries } from '@/lib/db/queries/casos.queries';
import { cambiosEstatusQueries } from '@/lib/db/queries/cambios-estatus.queries';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { nucleosQueries } from '@/lib/db/queries/nucleos.queries';
import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales.queries';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { accionesQueries } from '@/lib/db/queries/acciones.queries';
import { ejecutanQueries } from '@/lib/db/queries/ejecutan.queries';
import { citasQueries } from '@/lib/db/queries/citas.queries';
import { soportesQueries } from '@/lib/db/queries/soportes.queries';
import { asignacionesQueries } from '@/lib/db/queries/asignaciones.queries';
import { AppError, ValidationError, NotFoundError } from '@/lib/utils/errors';
import { withTransaction } from '@/lib/db/transactions';
import { loadSQL } from '@/lib/db/sql-loader';
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
     */
    getAllCasos: async () => {
        try {
            // Usar la query optimizada que incluye el profesor responsable en un JOIN
            const casos = await casosQueries.getAllWithProfesor() as any[];

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
     * @param client Cliente de base de datos opcional para transacción
     */
    createCaso: async (data: unknown, cedulaUsuario: string, client?: import('pg').PoolClient) => {
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

            // Validar fechas no futuras
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (validatedData.fecha_solicitud) {
                const fechaSolicitud = new Date(validatedData.fecha_solicitud);
                if (fechaSolicitud > today) {
                    throw new ValidationError('La fecha de solicitud no puede ser futura', { fecha_solicitud: ['La fecha no puede ser futura'] });
                }
            }
            if (validatedData.fecha_inicio_caso) {
                const fechaInicio = new Date(validatedData.fecha_inicio_caso);
                if (fechaInicio > today) {
                    throw new ValidationError('La fecha de inicio no puede ser futura', { fecha_inicio_caso: ['La fecha no puede ser futura'] });
                }
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
            const nuevoCaso = await casosQueries.create(casoData, client);

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
     * Actualiza un caso existente
     * @param idCaso ID del caso a actualizar
     * @param data Datos a actualizar
     * @param cedulaUsuario Cédula del usuario que realiza la actualización
     * @param externalClient Cliente de base de datos opcional para transacción externa
     */
    updateCaso: async (idCaso: number, data: unknown, cedulaUsuario: string, externalClient?: import('pg').PoolClient) => {
        try {
            const { UpdateCasoSchema } = await import('@/lib/validations/casos.schema');
            const validatedData = UpdateCasoSchema.parse({ ...(data as any), id_caso: idCaso });

            // Verificar que el caso existe
            const existingCaso = await casosQueries.getById(idCaso);
            if (!existingCaso) {
                throw new NotFoundError(`Caso con ID ${idCaso} no encontrado`);
            }

            // Validar existencia de relaciones si se están actualizando
            if (validatedData.id_nucleo) {
                const nucleoExists = await nucleosQueries.checkExists(validatedData.id_nucleo);
                if (!nucleoExists) {
                    throw new NotFoundError(`Núcleo con ID ${validatedData.id_nucleo} no encontrado`);
                }
            }

            // Validar ámbito legal si se actualiza alguno de sus componentes
            if (validatedData.id_materia || validatedData.num_ambito_legal) {
                // Obtener valores actuales o nuevos
                const idMateria = validatedData.id_materia || (existingCaso as any).id_materia;
                const numCategoria = validatedData.num_categoria ?? (existingCaso as any).num_categoria ?? 0;
                const numSubcategoria = validatedData.num_subcategoria ?? (existingCaso as any).num_subcategoria ?? 0;
                const numAmbitoLegal = validatedData.num_ambito_legal || (existingCaso as any).num_ambito_legal;

                const ambitoExists = await ambitosLegalesQueries.checkExists(
                    idMateria,
                    numCategoria,
                    numSubcategoria,
                    numAmbitoLegal
                );

                if (!ambitoExists) {
                    throw new NotFoundError(`Ámbito legal no encontrado para Materia ${idMateria}, Categ ${numCategoria}, Subcateg ${numSubcategoria}, Ambito ${numAmbitoLegal}`);
                }
            }

            // Validar fecha solicitud no futura
            if (validatedData.fecha_solicitud) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const fechaSolicitud = new Date(validatedData.fecha_solicitud);
                if (fechaSolicitud > today) {
                    throw new ValidationError('La fecha de solicitud no puede ser futura', { fecha_solicitud: ['La fecha no puede ser futura'] });
                }
            }

            // Validar si la cédula cambia y existe
            if (validatedData.cedula && validatedData.cedula !== (existingCaso as any).cedula) {
                const solicitanteExists = await solicitantesQueries.getSolicitanteById(validatedData.cedula);
                if (!solicitanteExists) {
                    throw new NotFoundError(`Solicitante con cédula ${validatedData.cedula} no encontrado`);
                }
            }

            // Preparar datos para actualización
            const updateData = {
                tramite: validatedData.tramite,
                observaciones: validatedData.observaciones || undefined,
                fecha_fin_caso: validatedData.fecha_fin_caso || undefined,
                id_nucleo: validatedData.id_nucleo,
                id_materia: validatedData.id_materia,
                num_categoria: validatedData.num_categoria,
                num_subcategoria: validatedData.num_subcategoria,
                num_ambito_legal: validatedData.num_ambito_legal,
                fecha_solicitud: validatedData.fecha_solicitud,
                cedula: validatedData.cedula,
            };

            // Lógica de actualización (abstraída para reutilizar)
            const performUpdate = async (client: import('pg').PoolClient) => {
                // Establecer variable de sesión para auditoría
                // Validar cédula
                if (!/^[A-Za-z0-9.\-]+$/.test(cedulaUsuario)) {
                    throw new Error('Formato de cédula inválido');
                }
                const cedulaEscapada = cedulaUsuario.replace(/'/g, "''");

                // Ejecutar SET LOCAL y UPDATE en la misma transacción y cliente
                await client.query(`SET LOCAL app.usuario_actualiza_caso = '${cedulaEscapada}'`);

                // Usar casosQueries.update que ahora acepta client
                // Nota: antes se usaba client.query directo aquí con loadSQL, ahora delegamos en casosQueries.update
                // pero casosQueries.update espera los datos ya procesados.
                // Como casosQueries.update ya está adaptado y hace loadSQL, lo llamamos directamente.
                // Sin embargo, el código original hacía la query inline aquí.
                // Para mantener la lógica exacta (y aprovechar que ya edité casosQueries.update), lo invoco.

                const result = await casosQueries.update(idCaso, {
                    tramite: updateData.tramite || (existingCaso as any).tramite,
                    observaciones: updateData.observaciones !== undefined ? updateData.observaciones : (existingCaso as any).observaciones,
                    fecha_fin_caso: updateData.fecha_fin_caso !== undefined ? updateData.fecha_fin_caso : (existingCaso as any).fecha_fin_caso,
                    id_nucleo: updateData.id_nucleo || (existingCaso as any).id_nucleo,
                    id_materia: updateData.id_materia || (existingCaso as any).id_materia,
                    num_categoria: updateData.num_categoria ?? (existingCaso as any).num_categoria,
                    num_subcategoria: updateData.num_subcategoria ?? (existingCaso as any).num_subcategoria,
                    num_ambito_legal: updateData.num_ambito_legal || (existingCaso as any).num_ambito_legal,
                    fecha_solicitud: updateData.fecha_solicitud ? (typeof updateData.fecha_solicitud === 'string' ? updateData.fecha_solicitud : updateData.fecha_solicitud) : (existingCaso as any).fecha_solicitud,
                    cedula: updateData.cedula || (existingCaso as any).cedula,
                }, client);
                return result;
            };

            // Si viene un cliente externo, usarlo directamente
            if (externalClient) {
                return await performUpdate(externalClient);
            }

            // Si no, usar transacción local (legacy safe)
            return await withTransaction(async (client) => {
                return await performUpdate(client);
            });

        } catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            // Si es un error de Zod
            if (error && typeof error === 'object' && 'issues' in error) {
                throw new ValidationError('Error de validación', {});
            }

            throw new AppError(
                'Error al actualizar el caso',
                500,
                error instanceof Error ? error.message : 'Error desconocido'
            );
        }
    },
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

            // Procesar resultados: usar datos obtenidos o arrays vacíos si fallaron
            // No lanzar error para permitir que el caso se incluya con datos parciales
            const extractResult = (index: number) => {
                if (results[index].status === 'fulfilled') {
                    return results[index].value;
                }
                const reason = results[index].reason;
                const msg = reason instanceof Error ? reason.message : String(reason || 'Error desconocido');
                console.warn(`[getCasoByIdCompleto] Query "${queryNames[index]}" falló para caso ${idCaso}: ${msg}`);
                return [];
            };

            const beneficiarios = extractResult(0);
            const equipo = extractResult(1);
            const acciones = extractResult(2);
            const citas = extractResult(3);
            const cambiosEstatus = extractResult(4);
            const soportes = extractResult(5);

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

    /**
     * Elimina una acción específica y todos sus ejecutores asociados
     */
    deleteAccion: async (params: {
        numAccion: number;
        idCaso: number;
        idUsuarioElimino: string;
        motivo: string;
    }): Promise<{ num_accion: number; id_caso: number }> => {
        try {
            // Asegurar que los parámetros sean números
            const numAccion = Number(params.numAccion);
            const idCaso = Number(params.idCaso);

            return await withTransaction(async (client) => {
                // Establecer variables de sesión para auditoría
                const cedulaEscapada = params.idUsuarioElimino.replace(/'/g, "''");
                const motivoEscapado = params.motivo.replace(/'/g, "''");
                await client.query(`SET LOCAL app.usuario_elimina_accion = '${cedulaEscapada}'`);
                await client.query(`SET LOCAL app.motivo_eliminacion_accion = '${motivoEscapado}'`);

                // 1. Obtener información completa de la acción antes de eliminarla
                const getAccionQuery = `
                    SELECT num_accion, id_caso, detalle_accion, comentario
                    FROM acciones
                    WHERE num_accion = $1 AND id_caso = $2
                `;

                const accionResult = await client.query(getAccionQuery, [numAccion, idCaso]);

                if (accionResult.rows.length === 0) {
                    throw new AppError('La acción no existe', 404);
                }

                const accion = accionResult.rows[0];

                // 2. Si la acción comienza con "Cita realizada el", buscar y eliminar la cita correspondiente
                // Aplicar EXACTAMENTE la misma lógica que en citas.service.ts (buscar por ejecutores)
                if (accion.detalle_accion.startsWith('Cita realizada el')) {
                    console.log('[DEBUG deleteAccion] Acción es de cita, iniciando eliminación bidireccional:', accion.detalle_accion);

                    // Buscar TODAS las citas para este caso
                    const findCitasQuery = `
                        SELECT c.num_cita, c.id_caso, c.fecha_encuentro, c.orientacion
                        FROM citas c
                        WHERE c.id_caso = $1
                    `;

                    const citasResult = await client.query(findCitasQuery, [idCaso]);

                    console.log('[DEBUG deleteAccion] Citas encontradas para el caso:', {
                        totalCitas: citasResult.rows.length,
                        citas: citasResult.rows.map(c => ({
                            num_cita: c.num_cita,
                            fecha_encuentro: c.fecha_encuentro,
                            orientacion: c.orientacion
                        }))
                    });

                    // Obtener ejecutores de la acción
                    const ejecutoresAccionQuery = `
                        SELECT id_usuario_ejecuta as id_usuario
                        FROM ejecutan
                        WHERE num_accion = $1 AND id_caso = $2
                        ORDER BY id_usuario_ejecuta
                    `;

                    const ejecutoresAccionResult = await client.query(ejecutoresAccionQuery, [numAccion, idCaso]);
                    const ejecutoresAccion = ejecutoresAccionResult.rows.map(r => r.id_usuario).sort();

                    console.log('[DEBUG deleteAccion] Ejecutores de la acción:', ejecutoresAccion);

                    // Para cada cita, verificar si corresponde a esta acción por ejecutores
                    let citaRelacionada = null;
                    for (const cita of citasResult.rows) {
                        // Obtener ejecutores de la cita
                        const ejecutoresCitaQuery = `
                            SELECT id_usuario
                            FROM atienden
                            WHERE num_cita = $1 AND id_caso = $2
                            ORDER BY id_usuario
                        `;

                        const ejecutoresCitaResult = await client.query(ejecutoresCitaQuery, [cita.num_cita, idCaso]);
                        const ejecutoresCita = ejecutoresCitaResult.rows.map(r => r.id_usuario).sort();

                        console.log('[DEBUG deleteAccion] Comparando ejecutores:', {
                            num_cita: cita.num_cita,
                            ejecutoresCita,
                            ejecutoresAccion,
                            coinciden: JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion)
                        });

                        // Comparar listas de ejecutores
                        const ejecutoresCoinciden = JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion);

                        if (ejecutoresCoinciden) {
                            // ¡Esta cita corresponde a la acción!
                            citaRelacionada = cita;
                            console.log('[DEBUG deleteAccion] ¡CITA ENCONTRADA! Se eliminará:', {
                                num_cita: citaRelacionada.num_cita,
                                id_caso: citaRelacionada.id_caso,
                                fecha_encuentro: citaRelacionada.fecha_encuentro
                            });
                            break; // Salir del loop, ya encontramos la cita correcta
                        }
                    }

                    // Eliminar la cita encontrada (si existe)
                    if (citaRelacionada) {
                        console.log('[DEBUG deleteAccion] Eliminando cita relacionada');

                        // Eliminar registros de atienden primero
                        const deleteAtiendenQuery = loadSQL('atienden/delete-by-cita.sql');
                        await client.query(deleteAtiendenQuery, [citaRelacionada.num_cita, idCaso]);

                        // Eliminar la cita
                        const deleteCitaQuery = loadSQL('citas/delete.sql');
                        await client.query(deleteCitaQuery, [citaRelacionada.num_cita, idCaso]);

                        console.log('[DEBUG deleteAccion] Cita eliminada exitosamente');
                    } else {
                        console.log('[DEBUG deleteAccion] No se encontró ninguna cita que corresponda exactamente a esta acción');
                    }
                }

                // 3. Obtener ejecutores y fechas de ejecución ANTES de eliminarlos (para auditoría)
                const getEjecutoresQuery = `
                    SELECT 
                        u.cedula,
                        u.nombres,
                        u.apellidos,
                        e.fecha_ejecucion
                    FROM ejecutan e
                    JOIN usuarios u ON e.id_usuario_ejecuta = u.cedula
                    WHERE e.num_accion = $1 AND e.id_caso = $2
                `;
                const ejecutoresResult = await client.query(getEjecutoresQuery, [numAccion, idCaso]);
                const ejecutoresData = ejecutoresResult.rows;

                // 4. Eliminar ejecutores asociados a la acción
                const deleteEjecutoresQuery = `
                    DELETE FROM ejecutan
                    WHERE num_accion = $1 AND id_caso = $2
                `;

                await client.query(deleteEjecutoresQuery, [numAccion, idCaso]);

                // 5. Eliminar la acción (el trigger creará el registro de auditoría)
                const deleteAccionQuery = `
                    DELETE FROM acciones
                    WHERE num_accion = $1 AND id_caso = $2
                    RETURNING num_accion, id_caso
                `;

                const result = await client.query(deleteAccionQuery, [numAccion, idCaso]);

                if (result.rows.length === 0) {
                    throw new AppError('No se pudo eliminar la acción', 500);
                }

                // 6. Insertar los ejecutores en la tabla normalizada de auditoría
                if (ejecutoresData.length > 0) {
                    // Obtener el ID del registro de auditoría recién creado
                    const auditoriaResult = await client.query(`
                        SELECT id FROM auditoria_eliminacion_acciones 
                        WHERE num_accion = $1 AND id_caso = $2 
                        ORDER BY fecha DESC LIMIT 1
                    `, [numAccion, idCaso]);

                    if (auditoriaResult.rows.length > 0) {
                        const idAuditoria = auditoriaResult.rows[0].id;

                        for (const ejecutor of ejecutoresData) {
                            await client.query(`
                                INSERT INTO auditoria_eliminacion_acciones_ejecutores 
                                (id_auditoria_eliminacion, id_usuario_ejecutor, nombres_ejecutor, apellidos_ejecutor, fecha_ejecucion)
                                VALUES ($1, $2, $3, $4, $5)
                            `, [
                                idAuditoria,
                                ejecutor.cedula,
                                ejecutor.nombres,
                                ejecutor.apellidos,
                                ejecutor.fecha_ejecucion
                            ]);
                        }
                    }
                }

                return result.rows[0];
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error al eliminar la acción (detalle DB):', error);
            throw new AppError(
                "Error al eliminar la acción",
                500,
                error instanceof Error ? error.message : "Error desconocido"
            );
        }
    },

    updateAccion: async (params: {
        numAccion: number;
        idCaso: number;
        detalleAccion: string;
        comentario: string | null;
        idUsuarioActualizo: string;
        ejecutores?: Array<{ idUsuario: string; fechaEjecucion: string }>;
    }) => {
        return await withTransaction(async (client) => {
            // Establecer variable de sesión para auditoría
            const cedulaEscapada = params.idUsuarioActualizo.replace(/'/g, "''");
            await client.query(`SET LOCAL app.usuario_actualiza_accion = '${cedulaEscapada}'`);

            // Verificar que la acción existe antes de actualizar
            const checkQuery = 'SELECT num_accion, detalle_accion, comentario FROM acciones WHERE num_accion = $1 AND id_caso = $2';
            const existingAction = await client.query(checkQuery, [params.numAccion, params.idCaso]);

            if (existingAction.rows.length === 0) {
                throw new NotFoundError('La acción no existe');
            }

            // Obtener ejecutores actuales para auditoría (antes de modificarlos)
            const currentEjecutoresQuery = `
                SELECT 
                    e.id_usuario_ejecuta as cedula,
                    e.fecha_ejecucion,
                    u.nombres,
                    u.apellidos
                FROM ejecutan e
                JOIN usuarios u ON e.id_usuario_ejecuta = u.cedula
                WHERE e.num_accion = $1 AND e.id_caso = $2
            `;
            const currentEjecutoresResult = await client.query(currentEjecutoresQuery, [params.numAccion, params.idCaso]);
            const ejecutoresAnteriores = currentEjecutoresResult.rows;

            // Actualizar la acción usando client de la transacción (el trigger crea el registro de auditoría base)
            const updateAccionQuery = loadSQL('acciones/update.sql');
            await client.query(updateAccionQuery, [params.numAccion, params.idCaso, params.detalleAccion, params.comentario]);

            // Si se proporcionan ejecutores, actualizarlos
            let ejecutoresNuevos: Array<{ cedula: string; nombres: string; apellidos: string; fecha_ejecucion: string }> = [];

            if (params.ejecutores !== undefined) {
                // Eliminar ejecutores existentes usando client
                const deleteEjecutanQuery = loadSQL('ejecutan/delete-by-accion.sql');
                await client.query(deleteEjecutanQuery, [params.numAccion, params.idCaso]);

                // Crear nuevos ejecutores si hay usuarios
                if (params.ejecutores.length > 0) {
                    // Obtener nombres de los nuevos ejecutores
                    const idsUsuarios = params.ejecutores.map(e => e.idUsuario);
                    const namesQuery = `SELECT cedula, nombres, apellidos FROM usuarios WHERE cedula = ANY($1)`;
                    const namesResult = await client.query(namesQuery, [idsUsuarios]);
                    const usersMap = new Map(namesResult.rows.map((u: any) => [u.cedula, { nombres: u.nombres, apellidos: u.apellidos }]));

                    const createEjecutanQuery = loadSQL('ejecutan/create.sql');
                    for (const ejecutor of params.ejecutores) {
                        await client.query(createEjecutanQuery, [
                            ejecutor.idUsuario,
                            params.numAccion,
                            params.idCaso,
                            ejecutor.fechaEjecucion
                        ]);

                        const userData = usersMap.get(ejecutor.idUsuario);
                        ejecutoresNuevos.push({
                            cedula: ejecutor.idUsuario,
                            nombres: userData?.nombres || '',
                            apellidos: userData?.apellidos || '',
                            fecha_ejecucion: ejecutor.fechaEjecucion
                        });
                    }
                }
            } else {
                // Si no se modifican los ejecutores, los nuevos son igual a los anteriores
                ejecutoresNuevos = ejecutoresAnteriores.map((e: any) => ({
                    cedula: e.cedula,
                    nombres: e.nombres,
                    apellidos: e.apellidos,
                    fecha_ejecucion: e.fecha_ejecucion instanceof Date
                        ? e.fecha_ejecucion.toISOString().split('T')[0]
                        : e.fecha_ejecucion
                }));
            }

            // Insertar ejecutores en tabla normalizada de auditoría
            // Solo si hubo cambios en la acción (el trigger inserta el registro base)
            const auditoriaResult = await client.query(`
                SELECT id FROM auditoria_actualizacion_acciones 
                WHERE num_accion = $1 AND id_caso = $2 
                ORDER BY fecha_actualizacion DESC LIMIT 1
            `, [params.numAccion, params.idCaso]);

            if (auditoriaResult.rows.length > 0) {
                const idAuditoria = auditoriaResult.rows[0].id;

                // Insertar ejecutores anteriores (tipo = 'anterior')
                for (const ejecutor of ejecutoresAnteriores) {
                    const fechaStr = ejecutor.fecha_ejecucion instanceof Date
                        ? ejecutor.fecha_ejecucion.toISOString().split('T')[0]
                        : ejecutor.fecha_ejecucion;

                    await client.query(`
                        INSERT INTO auditoria_actualizacion_acciones_ejecutores 
                        (id_auditoria_actualizacion, tipo, id_usuario_ejecutor, nombres_ejecutor, apellidos_ejecutor, fecha_ejecucion)
                        VALUES ($1, 'anterior', $2, $3, $4, $5)
                    `, [idAuditoria, ejecutor.cedula, ejecutor.nombres, ejecutor.apellidos, fechaStr]);
                }

                // Insertar ejecutores nuevos (tipo = 'nuevo')
                for (const ejecutor of ejecutoresNuevos) {
                    await client.query(`
                        INSERT INTO auditoria_actualizacion_acciones_ejecutores 
                        (id_auditoria_actualizacion, tipo, id_usuario_ejecutor, nombres_ejecutor, apellidos_ejecutor, fecha_ejecucion)
                        VALUES ($1, 'nuevo', $2, $3, $4, $5)
                    `, [idAuditoria, ejecutor.cedula, ejecutor.nombres, ejecutor.apellidos, ejecutor.fecha_ejecucion]);
                }
            }

            // Verificar que la acción se actualizó correctamente
            const updatedAction = await client.query(checkQuery, [params.numAccion, params.idCaso]);

            return {
                num_accion: params.numAccion,
                id_caso: params.idCaso,
                detalle_accion: params.detalleAccion,
                comentario: params.comentario,
            };
        });
    },

    /**
     * Agrega un semestre a un caso
     */
    addOcurrencia: async (idCaso: number, term: string): Promise<void> => {
        const query = loadSQL('casos/add-ocurrencia.sql');
        return await withTransaction(async (client) => {
            await client.query(query, [idCaso, term]);
        });
    },

    /**
     * Elimina un semestre de un caso
     */
    removeOcurrencia: async (idCaso: number, term: string): Promise<void> => {
        const query = loadSQL('casos/remove-ocurrencia.sql');
        return await withTransaction(async (client) => {
            await client.query(query, [idCaso, term]);
        });
    },

    /**
     * Obtiene los semestres de un caso
     */
    getSemestresByCaso: async (idCaso: number): Promise<Array<{ term: string; fecha_inicio: string; fecha_fin: string }>> => {
        const query = loadSQL('semestres/get-case-semesters.sql');
        // Usa withTransaction para lectura o pool directo
        // withTransaction provee un cliente, es seguro
        return await withTransaction(async (client) => {
            const result = await client.query(query, [idCaso]);
            return result.rows.map(row => ({
                term: row.term,
                fecha_inicio: row.fecha_inicio.toISOString().split('T')[0],
                fecha_fin: row.fecha_fin.toISOString().split('T')[0]
            }));
        });
    },
};

