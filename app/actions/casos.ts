'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { casosService } from '@/lib/services/casos.service';
import { revalidatePath } from 'next/cache';
import { soportesQueries } from '@/lib/db/queries/soportes.queries';
import { accionesQueries } from '@/lib/db/queries/acciones.queries';
import { cambiosEstatusQueries } from '@/lib/db/queries/cambios-estatus.queries';
import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { AppError, UnauthorizedError, ValidationError } from '@/lib/utils/errors';

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
export async function createCasoAction(data: any): Promise<CreateCasoResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No hay sesión activa. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Verificar token y obtener cédula del usuario (quien registra el caso)
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (verifyError) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const cedulaUsuario = decoded.cedula;
    const nuevoCaso = await casosService.createCaso(data, cedulaUsuario);

    // Revalidar cache de la página de casos
    revalidatePath('/dashboard/cases');

    return {
      success: true,
      data: nuevoCaso,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CASO_ERROR',
          fields: (error as any).fields,
        },
      };
    }

    console.error('Error en createCasoAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al crear caso',
        code: 'UNKNOWN_ERROR',
      },
    };
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No hay sesión activa',
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Verificar token
    await verifyToken(token);

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

    // Procesar cada archivo
    const resultados = [];
    for (const file of files) {
      if (!file || file.size === 0) {
        continue;
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
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UPLOAD_ERROR',
        },
      };
    }

    console.error('Error en uploadSoportesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al subir archivos',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener todos los casos
 */
export async function getCasosAction(): Promise<GetCasosResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const casos = await casosService.getAllCasos();

    return {
      success: true,
      data: casos,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CASO_ERROR',
        },
      };
    }

    console.error('Error en getCasosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener casos',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener casos del usuario actual
 */
export async function getCasosByUsuarioAction(): Promise<GetCasosResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    let decodedToken: any;
    try {
      decodedToken = await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const cedulaUsuario = decodedToken.cedula;
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
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CASO_ERROR',
        },
      };
    }

    console.error('Error en getCasosByUsuarioAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener casos del usuario',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener el siguiente número de caso disponible
 */
export async function getNextCaseNumberAction(): Promise<GetNextCaseNumberResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const nextNumber = await casosService.getNextCaseNumber();

    return {
      success: true,
      data: { nextNumber },
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CASO_ERROR',
        },
      };
    }

    console.error('Error en getNextCaseNumberAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener siguiente número de caso',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener un caso por ID con toda su información relacionada
 */
export async function getCasoByIdAction(idCaso: number): Promise<GetCasoByIdResult> {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No autorizado',
          code: 'UNAUTHORIZED',
        },
      };
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const caso = await casosService.getCasoByIdCompleto(idCaso);

    return {
      success: true,
      data: caso,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CASO_ERROR',
        },
      };
    }

    console.error('Error en getCasoByIdAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener el caso',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener todos los IDs de los casos
 */
export async function getCaseIdsAction(): Promise<{ success: boolean; data?: number[]; error?: { message: string; code?: string } }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return {
        success: false,
        error: { message: 'No autorizado', code: 'UNAUTHORIZED' },
      };
    }
    await verifyToken(token);

    const ids = await casosService.getAllCaseIds();
    return { success: true, data: ids };
  } catch (error) {
    return {
      success: false,
      error: { message: error instanceof Error ? error.message : 'Error al obtener IDs de casos', code: 'CASO_ERROR' },
    };
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
  ejecutores?: Array<{ idUsuario: string; fechaEjecucion: string }>
): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string } }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: {
          message: 'No hay sesión activa',
          code: 'UNAUTHORIZED',
        },
      };
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      await client.query('ROLLBACK');
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
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

    const cedulaUsuario = decoded.cedula;
    
    // Crear la acción usando el cliente de la transacción
    const createAccionQuery = loadSQL('acciones/create.sql');
    const accionResult = await client.query(createAccionQuery, [
      idCaso,
      detalleAccion.trim(),
      comentario?.trim() || null,
      cedulaUsuario,
      null, // numAccion se calcula automáticamente
    ]);
    const accion = accionResult.rows[0];

    // Crear registros de ejecutores si se proporcionaron
    if (ejecutores && ejecutores.length > 0) {
      const createEjecutanQuery = loadSQL('ejecutan/create.sql');
      for (const ejecutor of ejecutores) {
        const fechaEjecucion = new Date(ejecutor.fechaEjecucion);
        await client.query(createEjecutanQuery, [
          ejecutor.idUsuario,
          accion.num_accion,
          idCaso,
          fechaEjecucion,
        ]);
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: {
          message: 'No hay sesión activa',
          code: 'UNAUTHORIZED',
        },
      };
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const estatusValidos = ['En proceso', 'Archivado', 'Entregado', 'Asesoría'];
    if (!estatusValidos.includes(nuevoEstatus)) {
      return {
        success: false,
        error: {
          message: 'Estatus inválido',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const cedulaUsuario = decoded.cedula;
    const cambioEstatus = await cambiosEstatusQueries.create(
      idCaso,
      nuevoEstatus,
      cedulaUsuario,
      motivo?.trim() || undefined
    );

    revalidatePath(`/dashboard/cases/${idCaso}`);

    return {
      success: true,
      data: cambioEstatus,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'STATUS_ERROR',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al cambiar el estatus',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}