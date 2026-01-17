'use server';

import { casosService } from '@/lib/services/casos.service';
import { revalidatePath } from 'next/cache';
import { soportesQueries } from '@/lib/db/queries/soportes.queries';
import { accionesQueries } from '@/lib/db/queries/acciones.queries';
import { cambiosEstatusQueries } from '@/lib/db/queries/cambios-estatus.queries';
import { asignacionesQueries } from '@/lib/db/queries/asignaciones.queries';
import { profesoresQueries } from '@/lib/db/queries/profesores.queries';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes.queries';
import { semestresQueries } from '@/lib/db/queries/semestres.queries';
import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { casosQueries } from '@/lib/db/queries/casos.queries';
import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';
import { notificarVariosUsuariosAction } from './notificaciones';

export interface CreateCasoResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>;
  };
}

export interface UploadSoportesResult {
  success: boolean;
  data?: {
    mensaje: string;
    soportes: Array<{
      num_soporte: number;
      nombre_archivo: string;
    }>;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface DownloadSoporteResult {
  success: boolean;
  data?: {
    documento_data: string; // Base64
    nombre_archivo: string;
    tipo_mime: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface DeleteSoporteResult {
  success: boolean;
  data?: {
    mensaje: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetCasosResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetNextCaseNumberResult {
  success: boolean;
  data?: {
    nextNumber: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetCasoByIdResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

export interface CasoOption {
  value: string;
  label: string;
}

/**
 * Server Action para crear un nuevo caso
 */
/**
 * Server Action para crear un nuevo caso
 * Nota: Un caso se asocia a un SOLICITANTE (la persona que solicita el servicio legal).
 * El usuario que registra el caso (estudiante/profesor) es diferente del solicitante asociado al caso.
 */
export async function createCasoAction(data: unknown): Promise<CreateCasoResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedulaUsuario = authResult.user.cedula;
    const nuevoCaso = await casosService.createCaso(data, cedulaUsuario);

    // Revalidar cache de la página de casos
    revalidatePath('/dashboard/cases');
    revalidatePath('/dashboard/notificaciones');

    return {
      success: true,
      data: nuevoCaso,
    };
  } catch (error) {
    return handleServerActionError(error, 'createCasoAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para actualizar un caso existente
 */
export async function updateCasoAction(
  idCaso: number,
  data: unknown
): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string; fields?: Record<string, string[]> } }> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedulaUsuario = authResult.user.cedula;
    const casoActualizado = await casosService.updateCaso(idCaso, data, cedulaUsuario);

    // Revalidar cache de la página de casos
    revalidatePath('/dashboard/cases');
    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: casoActualizado,
    };
  } catch (error) {
    return handleServerActionError(error, 'updateCasoAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para subir soportes/documentos a un caso
 */
export async function uploadSoportesAction(
  idCaso: number,
  formData: FormData
): Promise<UploadSoportesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (isNaN(idCaso)) {
      return {
        success: false,
        error: {
          message: 'ID de caso inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Obtener archivos del FormData
    const files = formData.getAll('archivos') as File[];

    if (files.length === 0) {
      return {
        success: false,
        error: {
          message: 'No se proporcionaron archivos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Límite de tamaño: 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB en bytes

    // Procesar cada archivo
    const resultados = [];
    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
      }

      // Validar tamaño del archivo
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: {
            message: `El archivo "${file.name}" excede el límite de 10MB. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            code: 'FILE_TOO_LARGE',
          },
        };
      }

      // Convertir el archivo a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Crear el soporte en la base de datos
      const soporte = await soportesQueries.create({
        id_caso: idCaso,
        documento_data: buffer,
        nombre_archivo: file.name,
        tipo_mime: file.type || 'application/octet-stream',
        descripcion: undefined,
        fecha_consignacion: new Date(),
        id_usuario_subio: authResult.user.cedula, // Registrar quién subió el archivo
      });

      resultados.push({
        num_soporte: soporte.num_soporte,
        nombre_archivo: soporte.nombre_archivo,
      });
    }

    // Revalidar cache de la página de casos
    revalidatePath('/dashboard/cases');

    return {
      success: true,
      data: {
        mensaje: `${resultados.length} archivo(s) subido(s) correctamente`,
        soportes: resultados,
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'uploadSoportesAction', 'UPLOAD_ERROR');
  }
}

/**
 * Server Action para descargar un soporte/documento
 */
export async function downloadSoporteAction(
  idCaso: number,
  numSoporte: number
): Promise<DownloadSoporteResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (isNaN(idCaso) || isNaN(numSoporte)) {
      return {
        success: false,
        error: {
          message: 'ID de caso o número de soporte inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Obtener el documento de la base de datos
    const documento = await soportesQueries.getDocumento(idCaso, numSoporte);

    if (!documento) {
      return {
        success: false,
        error: {
          message: 'Soporte no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    // Convertir el Buffer a base64
    const base64Data = documento.documento_data.toString('base64');

    return {
      success: true,
      data: {
        documento_data: base64Data,
        nombre_archivo: documento.nombre_archivo,
        tipo_mime: documento.tipo_mime,
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'downloadSoporteAction', 'DOWNLOAD_ERROR');
  }
}

export interface DeleteSoporteResult {
  success: boolean;
  data?: {
    mensaje: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para eliminar un soporte/documento
 */
export async function deleteSoporteAction(
  idCaso: number,
  numSoporte: number,
  motivo: string
): Promise<DeleteSoporteResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (isNaN(idCaso) || isNaN(numSoporte)) {
      return {
        success: false,
        error: {
          message: 'ID de caso o número de soporte inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (!motivo || motivo.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El motivo de eliminación es obligatorio',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Eliminar el soporte de la base de datos (registra auditoría antes de eliminar)
    const deleted = await soportesQueries.delete(idCaso, numSoporte, authResult.user.cedula, motivo.trim());

    if (!deleted) {
      return {
        success: false,
        error: {
          message: 'Soporte no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    // Revalidar cache de la página de casos
    revalidatePath('/dashboard/cases');
    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: {
        mensaje: 'Soporte eliminado correctamente',
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'deleteSoporteAction', 'DELETE_ERROR');
  }
}

/**
 * Server Action para obtener todos los casos
 */
export async function getCasosAction(): Promise<GetCasosResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const casos = await casosService.getAllCasos();

    return {
      success: true,
      data: casos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCasosAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para obtener casos del usuario actual
 */
export async function getCasosByUsuarioAction(): Promise<GetCasosResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedulaUsuario = authResult.user.cedula;
    console.log('🔍 Buscando casos para usuario:', cedulaUsuario);

    // Debug: Verificar si hay asignaciones en se_le_asigna
    const { pool } = await import('@/lib/db/pool');
    const debugQuery = await pool.query(
      'SELECT term, cedula_estudiante, id_caso, habilitado FROM se_le_asigna WHERE cedula_estudiante = $1',
      [cedulaUsuario]
    );
    console.log('📋 Asignaciones en se_le_asigna:', debugQuery.rows.length);
    if (debugQuery.rows.length > 0) {
      console.log('   Asignaciones encontradas:', debugQuery.rows);
    } else {
      console.log('   ⚠️  No hay asignaciones en se_le_asigna para esta cédula');
    }

    const { casosQueries } = await import('@/lib/db/queries/casos.queries');
    const casos = await casosQueries.getByUsuario(cedulaUsuario);

    console.log('📊 Casos encontrados por query:', casos.length);
    if (casos.length > 0) {
      console.log('   Primer caso:', JSON.stringify(casos[0], null, 2));
    } else {
      console.log('   ⚠️  No se encontraron casos asignados para este usuario');
      // Debug adicional: verificar si los casos existen
      const casosDebug = await pool.query(
        'SELECT c.id_caso, c.tramite FROM casos c INNER JOIN se_le_asigna sla ON c.id_caso = sla.id_caso WHERE sla.cedula_estudiante = $1 AND sla.habilitado = true',
        [cedulaUsuario]
      );
      console.log('   🔍 Casos directos (sin JOINs complejos):', casosDebug.rows.length);
      if (casosDebug.rows.length > 0) {
        console.log('   Casos directos:', casosDebug.rows);
      }
    }

    return {
      success: true,
      data: casos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCasosByUsuarioAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para obtener el siguiente número de caso disponible
 */
export async function getNextCaseNumberAction(): Promise<GetNextCaseNumberResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const nextNumber = await casosService.getNextCaseNumber();

    return {
      success: true,
      data: { nextNumber },
    };
  } catch (error) {
    return handleServerActionError(error, 'getNextCaseNumberAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para obtener un caso por ID con toda su información relacionada
 */
export async function getCasoByIdAction(idCaso: number): Promise<GetCasoByIdResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const caso = await casosService.getCasoByIdCompleto(idCaso);

    return {
      success: true,
      data: caso,
    };
  } catch (error) {
    return handleServerActionError(error, 'getCasoByIdAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para obtener todos los IDs de los casos
 */
export async function getCaseIdsAction(): Promise<{ success: boolean; data?: number[]; error?: { message: string; code?: string } }> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const ids = await casosService.getAllCaseIds();
    return { success: true, data: ids };
  } catch (error) {
    return handleServerActionError(error, 'getCaseIdsAction', 'CASO_ERROR');
  }
}

/**
 * Server Action para crear una acción para un caso
 * @param ejecutores Array de objetos con idUsuario y fechaEjecucion
 */
export async function createAccionAction(
  idCaso: number,
  detalleAccion: string,
  comentario?: string,
  ejecutores?: Array<{ idUsuario: string; fechaEjecucion: string }>,
  fechaRegistro?: string
): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string } }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!detalleAccion || detalleAccion.trim() === '') {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: {
          message: 'El detalle de la acción es requerido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const cedulaUsuario = authResult.user.cedula;

    // Obtener la fecha actual del cliente en formato YYYY-MM-DD para evitar problemas de zona horaria
    // Si no se proporciona fechaRegistro, usar la fecha actual del cliente
    const fechaRegistroStr = fechaRegistro || (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })();

    // Establecer variable de sesión para auditoría
    const cedulaEscapada = cedulaUsuario.replace(/'/g, "''");
    await client.query(`SET LOCAL app.usuario_registra = '${cedulaEscapada}'`);

    // Crear la acción usando el cliente de la transacción
    const createAccionQuery = loadSQL('acciones/create.sql');
    const accionResult = await client.query(createAccionQuery, [
      idCaso,
      detalleAccion.trim(),
      comentario?.trim() || null,
      cedulaUsuario,
      null, // numAccion se calcula automáticamente
      fechaRegistroStr, // Fecha de registro explícita
    ]);
    const accion = accionResult.rows[0];
    console.log('[DEBUG] createAccionAction - Acción creada:', accion);

    // Crear registros de ejecutores si se proporcionaron
    if (ejecutores && ejecutores.length > 0) {
      const createEjecutanQuery = loadSQL('ejecutan/create.sql');
      for (const ejecutor of ejecutores) {
        // Pasar la fecha como string directamente para evitar problemas de zona horaria
        // El formato YYYY-MM-DD es aceptado directamente por PostgreSQL para columnas DATE
        const fechaEjecucion = ejecutor.fechaEjecucion;
        await client.query(createEjecutanQuery, [
          ejecutor.idUsuario,
          accion.num_accion,
          idCaso,
          fechaEjecucion,
        ]);
      }

      // Guardar los ejecutores en la tabla normalizada de auditoría (para que no se pierdan si la acción es eliminada)
      // Obtener el ID del registro de auditoría más reciente
      const auditoriaResult = await client.query(`
        SELECT id FROM auditoria_insercion_acciones 
        WHERE num_accion = $1 AND id_caso = $2 
        ORDER BY fecha_creacion DESC LIMIT 1
      `, [accion.num_accion, idCaso]);

      if (auditoriaResult.rows.length > 0) {
        const idAuditoria = auditoriaResult.rows[0].id;

        // Obtener los nombres de los ejecutores
        const ejecutoresIds = ejecutores.map(e => e.idUsuario);
        const nombresQuery = `SELECT cedula, nombres, apellidos FROM usuarios WHERE cedula = ANY($1)`;
        const nombresResult = await client.query(nombresQuery, [ejecutoresIds]);
        const usersMap = new Map(nombresResult.rows.map((u: any) => [u.cedula, { nombres: u.nombres, apellidos: u.apellidos }]));

        // Insertar en tabla normalizada de ejecutores de auditoría
        for (const ejecutor of ejecutores) {
          const userData = usersMap.get(ejecutor.idUsuario);
          await client.query(`
            INSERT INTO auditoria_insercion_acciones_ejecutores 
            (id_auditoria_insercion, id_usuario_ejecutor, nombres_ejecutor, apellidos_ejecutor, fecha_ejecucion)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            idAuditoria,
            ejecutor.idUsuario,
            userData?.nombres || null,
            userData?.apellidos || null,
            ejecutor.fechaEjecucion
          ]);
        }
      }
    }

    await client.query('COMMIT');
    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: accion,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ACCION_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al crear la acción',
        code: 'UNKNOWN_ERROR',
      },
    };
  } finally {
    client.release();
  }
}

/**
 * Server Action para cambiar el estatus de un caso
 */
export async function changeStatusAction(
  idCaso: number,
  nuevoEstatus: string,
  motivo?: string
): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string } }> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const estatusValidos = ["En proceso", "Archivado", "Entregado", "Asesoría"];
    if (!estatusValidos.includes(nuevoEstatus)) {
      return {
        success: false,
        error: {
          message: "Estatus inválido",
          code: "VALIDATION_ERROR",
        },
      };
    }

    const cedulaUsuario = authResult.user.cedula;
    const cambioEstatus = await cambiosEstatusQueries.create(
      idCaso,
      nuevoEstatus,
      cedulaUsuario,
      motivo?.trim() || undefined
    );


    // Obtener todos los participantes del caso (profesores y estudiantes)
    const equipo = await asignacionesQueries.getEquipoByCaso(idCaso);
    const cedulasParticipantes = equipo
      .filter((m) => m.habilitado)
      .map((m) => m.cedula);

    if (cedulasParticipantes.length > 0) {
      await notificarVariosUsuariosAction({
        cedulasReceptores: cedulasParticipantes,
        titulo: 'Cambio de estatus en caso',
        mensaje: `El caso #${idCaso} ha cambiado su estatus a "${nuevoEstatus}". Por favor, revisa los detalles en el sistema.`,
      });
    }

    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: cambioEstatus,
    };
  } catch (error) {
    return handleServerActionError(error, 'changeStatusAction', 'STATUS_ERROR');
  }
}

export interface GetEquipoDisponibleResult {
  success: boolean;
  data?: {
    profesores: Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      correo_electronico: string | null;
      telefono_celular: string | null;
      term: string;
      tipo_profesor: string;
    }>;
    estudiantes: Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      correo_electronico: string | null;
      telefono_celular: string | null;
      term: string;
      tipo_estudiante: string;
      nrc: string;
    }>;
    term: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export async function getEquipoDisponibleAction(): Promise<GetEquipoDisponibleResult> {
  try {
    // Obtener el semestre actual (el más reciente)
    const semestres = await semestresQueries.getAll();
    if (semestres.length === 0) {
      return {
        success: false,
        error: {
          message: 'No hay semestres disponibles',
          code: 'NO_SEMESTRES',
        },
      };
    }

    const currentTerm = semestres[0].term; // El primero es el más reciente

    // Obtener profesores y estudiantes activos de todos los semestres
    // Esto permite encontrar profesores/estudiantes aunque no estén en el semestre actual
    const [profesoresAll, estudiantesAll] = await Promise.all([
      profesoresQueries.getAllActive(),
      estudiantesQueries.getAllActive(),
    ]);

    // Priorizar profesores y estudiantes del semestre actual
    const profesoresCurrentTerm = profesoresAll.filter(p => p.term === currentTerm);
    const estudiantesCurrentTerm = estudiantesAll.filter(e => e.term === currentTerm);

    // Combinar: primero los del semestre actual, luego los demás (sin duplicados)
    const profesoresMap = new Map<string, typeof profesoresAll[0]>();
    const estudiantesMap = new Map<string, typeof estudiantesAll[0]>();

    // Agregar primero los del semestre actual
    profesoresCurrentTerm.forEach(p => profesoresMap.set(p.cedula, p));
    estudiantesCurrentTerm.forEach(e => estudiantesMap.set(e.cedula, e));

    // Agregar los demás si no están ya incluidos
    profesoresAll.forEach(p => {
      if (!profesoresMap.has(p.cedula)) {
        profesoresMap.set(p.cedula, p);
      }
    });
    estudiantesAll.forEach(e => {
      if (!estudiantesMap.has(e.cedula)) {
        estudiantesMap.set(e.cedula, e);
      }
    });

    const profesores = Array.from(profesoresMap.values());
    const estudiantes = Array.from(estudiantesMap.values());

    return {
      success: true,
      data: {
        profesores,
        estudiantes,
        term: currentTerm,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener equipo disponible',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export interface AsignarEquipoResult {
  success: boolean;
  data?: {
    mensaje: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetAccionesRecientesResult {
  success: boolean;
  data?: Array<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
    nombres_usuario_registra: string;
    apellidos_usuario_registra: string;
    nombre_completo_usuario_registra: string;
    caso_id: number;
    nombre_solicitante: string;
    nombre_nucleo: string;
    ejecutores: Array<{
      id_usuario: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
      fecha_ejecucion: string;
    }>;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener acciones recientes del usuario
 */
export async function getAccionesRecientesAction(limite: number = 10): Promise<GetAccionesRecientesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedulaUsuario = authResult.user.cedula;
    const acciones = await accionesQueries.getRecentByUsuario(cedulaUsuario, limite);

    return {
      success: true,
      data: acciones,
    };
  } catch (error) {
    return handleServerActionError(error, 'getAccionesRecientesAction', 'ACCION_ERROR');
  }
}

// Server Action para asignar equipo (profesores y estudiantes) a un caso
export async function asignarEquipoAction(
  idCaso: number,
  profesores: string[],
  estudiantes: string[]
): Promise<AsignarEquipoResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedulaEmisor = authResult.user.cedula;
    const emisor = await usuariosQueries.getCompleteByCedula(cedulaEmisor);
    const nombreEmisor = emisor?.nombre_completo || cedulaEmisor;

    // Obtener el semestre actual
    const semestres = await semestresQueries.getAll();
    if (semestres.length === 0) {
      return {
        success: false,
        error: {
          message: 'No hay semestres disponibles',
          code: 'NO_SEMESTRES',
        },
      };
    }

    const currentTerm = semestres[0].term;

    // Usar transacción para asegurar atomicidad
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener asignaciones actuales del caso
      const equipoActual = await asignacionesQueries.getEquipoByCaso(idCaso);
      const profesoresActuales = equipoActual
        .filter(m => m.tipo === 'profesor' && m.habilitado)
        .map(m => m.cedula);
      const estudiantesActuales = equipoActual
        .filter(m => m.tipo === 'estudiante' && m.habilitado)
        .map(m => m.cedula);

      // Identificar profesores nuevos (que no estaban asignados antes)
      const profesoresNuevos = profesores.filter(cedula => !profesoresActuales.includes(cedula));

      // Identificar estudiantes nuevos (que no estaban asignados antes)
      const estudiantesNuevos = estudiantes.filter(cedula => !estudiantesActuales.includes(cedula));

      // Obtener todos los profesores activos para verificar disponibilidad
      const profesoresAllActive = await profesoresQueries.getAllActive();
      const profesoresAllActiveCedulas = new Set(profesoresAllActive.map(p => p.cedula));
      const profesoresAllActiveMap = new Map(profesoresAllActive.map(p => [p.cedula, p]));

      // Obtener todos los estudiantes activos para verificar disponibilidad
      const estudiantesAllActive = await estudiantesQueries.getAllActive();
      const estudiantesAllActiveCedulas = new Set(estudiantesAllActive.map(e => e.cedula));
      const estudiantesAllActiveMap = new Map(estudiantesAllActive.map(e => [e.cedula, e]));

      // Verificar que los profesores nuevos existan (en cualquier semestre)
      if (profesoresNuevos.length > 0) {
        const profesoresInvalidos = profesoresNuevos.filter(cedula => !profesoresAllActiveCedulas.has(cedula));

        if (profesoresInvalidos.length > 0) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: {
              message: `Los siguientes profesores no están disponibles: ${profesoresInvalidos.join(', ')}`,
              code: 'PROFESORES_INVALIDOS',
            },
          };
        }
      }

      // Verificar que los estudiantes nuevos existan (en cualquier semestre)
      if (estudiantesNuevos.length > 0) {
        const estudiantesInvalidos = estudiantesNuevos.filter(cedula => !estudiantesAllActiveCedulas.has(cedula));

        if (estudiantesInvalidos.length > 0) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: {
              message: `Los siguientes estudiantes no están disponibles: ${estudiantesInvalidos.join(', ')}`,
              code: 'ESTUDIANTES_INVALIDOS',
            },
          };
        }
      }

      // Deshabilitar profesores que ya no están en la lista
      for (const cedula of profesoresActuales) {
        if (!profesores.includes(cedula)) {
          // Obtener el term del profesor actual para deshabilitarlo correctamente
          const profesorActual = equipoActual.find(m => m.tipo === 'profesor' && m.cedula === cedula);
          const termProfesor = profesorActual?.term || currentTerm;
          await asignacionesQueries.removeSupervisa(termProfesor, cedula, idCaso);
        }
      }

      // Deshabilitar estudiantes que ya no están en la lista
      for (const cedula of estudiantesActuales) {
        if (!estudiantes.includes(cedula)) {
          // Obtener el term del estudiante actual para deshabilitarlo correctamente
          const estudianteActual = equipoActual.find(m => m.tipo === 'estudiante' && m.cedula === cedula);
          const termEstudiante = estudianteActual?.term || currentTerm;
          await asignacionesQueries.removeSeLeAsigna(termEstudiante, cedula, idCaso);
        }
      }

      // Crear o actualizar asignaciones de profesores nuevos
      // Usar el term del semestre actual si el profesor está en ese semestre, 
      // de lo contrario usar el term más reciente donde esté registrado
      for (const cedula of profesoresNuevos) {
        const profesorInfo = profesoresAllActiveMap.get(cedula);
        if (profesorInfo) {
          // Si el profesor está en el semestre actual, usar ese term
          // Si no, usar el term más reciente donde esté registrado
          const termToUse = profesorInfo.term === currentTerm
            ? currentTerm
            : profesorInfo.term;
          await asignacionesQueries.createSupervisa(termToUse, cedula, idCaso, true);
        }
      }

      // Crear o actualizar asignaciones de estudiantes nuevos
      // Usar el term del semestre actual si el estudiante está en ese semestre,
      // de lo contrario usar el term más reciente donde esté registrado
      for (const cedula of estudiantesNuevos) {
        const estudianteInfo = estudiantesAllActiveMap.get(cedula);
        if (estudianteInfo) {
          // Si el estudiante está en el semestre actual, usar ese term
          // Si no, usar el term más reciente donde esté registrado
          const termToUse = estudianteInfo.term === currentTerm
            ? currentTerm
            : estudianteInfo.term;
          await asignacionesQueries.createSeLeAsigna(termToUse, cedula, idCaso, true);
        }
      }

      await client.query('COMMIT');

      // Notificar solo si la asignación fue exitosa
      if (profesoresNuevos.length > 0) {
        await notificarVariosUsuariosAction({
          cedulasReceptores: profesoresNuevos,
          titulo: 'Asignación a caso',
          mensaje: `Has sido asignado como profesor supervisor al caso #${idCaso} por ${nombreEmisor}. Por favor, revisa los detalles en el sistema.`,
        });
      }

      if (estudiantesNuevos.length > 0) {
        await notificarVariosUsuariosAction({
          cedulasReceptores: estudiantesNuevos,
          titulo: 'Asignación a caso',
          mensaje: `Has sido asignado al caso #${idCaso} por ${nombreEmisor}. Por favor, revisa los detalles en el sistema.`,
        });
      }

      revalidatePath(`/dashboard/cases/${idCaso}`);

      return {
        success: true,
        data: {
          mensaje: 'Equipo asignado exitosamente',
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ASIGNACION_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al asignar equipo',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export interface DeleteAccionParams {
  numAccion: number;
  idCaso: number;
  motivo?: string;
}

export interface DeleteAccionResult {
  success: boolean;
  data?: {
    num_accion: number;
    id_caso: number;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export interface UpdateAccionParams {
  numAccion: number;
  idCaso: number;
  detalleAccion: string;
  comentario?: string;
  ejecutores?: Array<{ idUsuario: string; fechaEjecucion: string }>;
}

export interface UpdateAccionResult {
  success: boolean;
  data?: unknown;
  error?: { message: string; code?: string };
}

/**
 * Server Action para eliminar una acción específica
 */
export async function deleteAccionAction(params: DeleteAccionParams): Promise<DeleteAccionResult> {
  try {
    // Verificar autenticación usando la función centralizada
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar parámetros
    if (!params.numAccion || !params.idCaso) {
      return {
        success: false,
        error: {
          message: 'Parámetros inválidos: numAccion e idCaso son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Eliminar la acción
    const result = await casosService.deleteAccion({
      numAccion: params.numAccion,
      idCaso: params.idCaso,
      idUsuarioElimino: authResult.user.cedula,
      motivo: params.motivo || 'Sin motivo especificado',
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ACCION_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al eliminar la acción',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para actualizar una acción específica
 */
export async function updateAccionAction(params: UpdateAccionParams): Promise<UpdateAccionResult> {
  try {
    // Verificar autenticación usando la función centralizada
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar parámetros
    if (!params.numAccion || !params.idCaso || !params.detalleAccion || params.detalleAccion.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Parámetros inválidos: numAccion, idCaso y detalleAccion son requeridos',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Actualizar la acción
    const result = await casosService.updateAccion({
      numAccion: params.numAccion,
      idCaso: params.idCaso,
      detalleAccion: params.detalleAccion.trim(),
      comentario: params.comentario?.trim() || null,
      idUsuarioActualizo: authResult.user.cedula,
      ejecutores: params.ejecutores,
    });

    // Invalidar el cache de Next.js para este caso
    revalidatePath(`/dashboard/cases/${params.idCaso}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ACCION_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al actualizar la acción',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export interface DeleteCasoResult {
  success: boolean;
  data?: {
    mensaje: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para eliminar un caso permanentemente
 */
export async function deleteCasoAction(
  idCaso: number,
  motivo: string
): Promise<DeleteCasoResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar que el ID del caso sea válido
    if (isNaN(idCaso) || idCaso <= 0) {
      return {
        success: false,
        error: {
          message: 'ID de caso inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar que el motivo no esté vacío
    if (!motivo || motivo.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El motivo de eliminación es obligatorio',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar que el usuario sea coordinador (solo coordinadores pueden eliminar casos)
    if (authResult.user.rol !== 'Coordinador') {
      return {
        success: false,
        error: {
          message: 'Solo los coordinadores pueden eliminar casos permanentemente',
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Eliminar el caso (la función maneja todas las referencias y la auditoría)
    await casosQueries.deleteFisico(
      idCaso,
      authResult.user.cedula,
      motivo.trim()
    );

    // Revalidar cache de las páginas relacionadas
    revalidatePath('/dashboard/cases');
    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: {
        mensaje: 'Caso eliminado correctamente',
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'deleteCasoAction', 'DELETE_ERROR');
  }
}

// ============================================================================
// ARCHIVO DE CASOS INACTIVOS
// ============================================================================

export interface InactiveCase {
  id_caso: number;
  fecha_inicio_caso: string;
  fecha_fin_caso: string | null;
  fecha_solicitud: string;
  tramite: string;
  estatus: string;
  cant_beneficiarios: number;
  observaciones: string;
  id_nucleo: number;
  id_materia: number;
  num_categoria: number;
  num_subcategoria: number;
  num_ambito_legal: number;
  cedula: string;
  nombres_solicitante: string;
  apellidos_solicitante: string;
  nombre_completo_solicitante: string;
  nombre_nucleo: string;
  nombre_materia: string;
  nombre_categoria: string;
  nombre_subcategoria: string;
  fecha_ultima_actividad: string;
  meses_inactividad: number;
}

export interface GetInactiveCasesResult {
  success: boolean;
  data?: InactiveCase[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener casos inactivos candidatos a archivar
 * Un caso es inactivo si no ha tenido actividad en N meses (por defecto 12 = 2 semestres)
 * @param mesesInactividad - Número de meses de inactividad (por defecto 12)
 */
export async function getInactiveCasesAction(
  mesesInactividad: number = 12
): Promise<GetInactiveCasesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Solo coordinadores pueden ver y archivar casos inactivos
    if (authResult.user.rol !== 'Coordinador') {
      return {
        success: false,
        error: {
          message: 'Solo los coordinadores pueden gestionar el archivo de casos inactivos',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const casosInactivos = await casosQueries.getInactiveCases(mesesInactividad);

    return {
      success: true,
      data: casosInactivos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getInactiveCasesAction', 'CASO_ERROR');
  }
}

export interface ArchiveCasesResult {
  success: boolean;
  data?: {
    archived: number;
    errors: Array<{ id_caso: number; error: string }>;
    mensaje: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para archivar múltiples casos inactivos
 * @param idsCasos - Array de IDs de casos a archivar
 * @param motivo - Motivo del archivo (opcional, se genera automáticamente)
 */
export async function archiveInactiveCasesAction(
  idsCasos: number[],
  motivo?: string
): Promise<ArchiveCasesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Solo coordinadores pueden archivar casos
    if (authResult.user.rol !== 'Coordinador') {
      return {
        success: false,
        error: {
          message: 'Solo los coordinadores pueden archivar casos',
          code: 'UNAUTHORIZED',
        },
      };
    }

    if (!idsCasos || idsCasos.length === 0) {
      return {
        success: false,
        error: {
          message: 'No se proporcionaron casos para archivar',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const result = await casosQueries.archiveCases(
      idsCasos,
      authResult.user.cedula,
      motivo
    );

    // Revalidar cache de las páginas relacionadas
    revalidatePath('/dashboard/cases');
    for (const id of idsCasos) {
      revalidatePath(`/dashboard/cases/${id}`);
    }

    return {
      success: true,
      data: {
        ...result,
        mensaje: `${result.archived} caso(s) archivado(s) correctamente${result.errors.length > 0 ? `. ${result.errors.length} error(es).` : ''}`,
      },
    };
  } catch (error) {
    return handleServerActionError(error, 'archiveInactiveCasesAction', 'ARCHIVE_ERROR');
  }
}
