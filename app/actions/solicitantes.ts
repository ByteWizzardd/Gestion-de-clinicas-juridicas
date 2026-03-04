'use server';

import { solicitantesService } from '@/lib/services/solicitantes.service';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { SolicitantesService } from '@/lib/services/solicitantes.service';
import { AppError } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/utils/logger';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

import type { Solicitante as SolicitanteListItem } from '@/lib/db/queries/solicitantes.queries';
import type { SolicitanteCompleto } from '@/lib/db/queries/solicitantes.queries';

type ApplicantFormData = Parameters<(typeof solicitantesService)['create']>[0];

type SearchByCedulaRow = Awaited<ReturnType<(typeof solicitantesQueries)['searchByCedula']>>[number];
type SearchByEmailRow = Awaited<ReturnType<(typeof solicitantesQueries)['searchUsuariosByEmail']>>[number];
type SearchSolicitantesRow = SearchByCedulaRow | SearchByEmailRow;

export interface CreateSolicitanteResult {
  success: boolean;
  data?: unknown;
  error?: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>;
  };
}

export interface GetSolicitantesResult {
  success: boolean;
  data?: SolicitanteListItem[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetSolicitanteByIdResult {
  success: boolean;
  data?: SolicitanteCompleto;
  error?: {
    message: string;
    code?: string;
  };
}

export interface SearchSolicitantesResult {
  success: boolean;
  data?: SearchSolicitantesRow[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para crear un nuevo solicitante
 * Nota: Un solicitante es una persona que solicita servicios legales en la clínica.
 * Esto es diferente de registrar un usuario (estudiante/profesor/coordinador).
 */
export async function createSolicitanteAction(data: ApplicantFormData): Promise<CreateSolicitanteResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const result = await solicitantesService.create(data, authResult.user.cedula);

    // Revalidar cache de la página de solicitantes
    revalidatePath('/dashboard/applicants');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'createSolicitanteAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para obtener todos los solicitantes
 */
export async function getSolicitantesAction(): Promise<GetSolicitantesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const result = await solicitantesQueries.getAllSolicitantes();

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
          code: error.code || 'SOLICITANTE_ERROR',
        },
      };
    }

    logger.error('Error en getSolicitantesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener solicitantes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener un solicitante por ID (cédula)
 */
export async function getSolicitanteByIdAction(cedula: string): Promise<GetSolicitanteByIdResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!cedula) {
      return {
        success: false,
        error: {
          message: 'Cédula del solicitante es requerida',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const solicitante = await SolicitantesService.getSolicitanteCompleto(cedula);

    if (!solicitante) {
      return {
        success: false,
        error: {
          message: 'Solicitante no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: solicitante,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSolicitanteByIdAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para buscar usuarios (excluyendo solicitantes) por cédula
 * Útil para recomendaciones cuando se busca un usuario del sistema
 */
export async function searchUsuariosAction(
  query: string,
  excludeSolicitantes: boolean = true
): Promise<SearchSolicitantesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    let resultados;
    if (excludeSolicitantes) {
      resultados = await solicitantesQueries.searchUsuariosByCedulaExcludeSolicitantes(query.trim());
    } else {
      resultados = await solicitantesQueries.searchUsuariosByCedula(query.trim());
    }

    return {
      success: true,
      data: resultados,
    };
  } catch (error) {
    return handleServerActionError(error, 'searchUsuariosAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para buscar solicitantes
 * @param query - Término de búsqueda (cédula o email)
 * @param type - Tipo de búsqueda: 'cedula' o 'email'
 */
export async function searchSolicitantesAction(
  query: string,
  type: 'cedula' | 'email' = 'cedula'
): Promise<SearchSolicitantesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    let resultados;
    if (type === 'email') {
      // Buscar usuarios por email (estudiantes, profesores, coordinadores)
      resultados = await solicitantesQueries.searchUsuariosByEmail(query.trim());
    } else {
      // type === 'cedula' (por defecto)
      resultados = await solicitantesQueries.searchByCedula(query.trim());
    }

    return {
      success: true,
      data: resultados,
    };
  } catch (error) {
    return handleServerActionError(error, 'searchSolicitantesAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para verificar si un correo electrónico ya existe en otro solicitante
 */
export async function checkEmailExistsAction(
  email: string,
  excludeCedula?: string
): Promise<{ success: boolean; exists: boolean; data?: { cedula: string; nombres: string; apellidos: string } }> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        exists: false,
      };
    }

    if (!email || email.trim().length === 0) {
      return {
        success: true,
        exists: false,
      };
    }

    const result = await solicitantesQueries.checkEmailExists(email.trim(), excludeCedula);

    return {
      success: true,
      exists: result !== null,
      data: result || undefined,
    };
  } catch (error) {
    logger.error('Error en checkEmailExistsAction:', error);
    return {
      success: false,
      exists: false,
    };
  }
}

/**
 * Server Action para actualizar un solicitante existente
 */
export async function updateSolicitanteAction(cedulaOriginal: string, data: ApplicantFormData): Promise<CreateSolicitanteResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!cedulaOriginal) {
      return {
        success: false,
        error: {
          message: 'La cédula original es requerida para actualizar',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const result = await solicitantesService.update(cedulaOriginal, data, authResult.user.cedula);

    // Actualizar datos en usuarios y beneficiarios si existen
    if (cedulaOriginal) {
      try {
        const promises = [];

        // Actualizar usuario (basic info + contact info)
        // SOLO si el solicitante también es un usuario registrado en el sistema.
        if (data.nombres && data.apellidos && data.correoElectronico) {
          const telefono = data.telefonoCelular || '';

          try {
            const client = await pool.connect();
            try {
              // PRIMERO: Verificar si el solicitante existe como usuario
              const checkUserResult = await client.query(
                'SELECT 1 FROM usuarios WHERE cedula = $1',
                [cedulaOriginal]
              );

              // Solo sincronizar si el usuario EXISTE
              if (checkUserResult.rows.length > 0) {
                await client.query('BEGIN');

                // Variable para saltar el trigger de auditoría de usuarios (por si acaso)
                await client.query("SELECT set_config('app.sync_solicitante_mode', 'true', true)");
                await client.query("SELECT set_config('app.usuario_actualiza_usuario', $1, true)", [authResult.user.cedula]);

                // Ejecutar update
                const updateQuery = loadSQL('usuarios/update-contact-info.sql');
                await client.query(updateQuery, [cedulaOriginal, data.nombres, data.apellidos, data.correoElectronico, telefono, authResult.user.cedula]);

                await client.query('COMMIT');
              } else {
              }
            } catch (e) {
              await client.query('ROLLBACK');
              logger.error('Error sincronizando usuario:', e);
            } finally {
              client.release();
            }
          } catch (error) {
            logger.error('Error obteniendo cliente para sync:', error);
          }
        }

        // Actualizar beneficiario - tolerar posibles nombres alternativos de campos
        const dataRecord = data as unknown as Record<string, unknown>;
        const nombres = data.nombres;
        const apellidos = data.apellidos;

        const fechaNac =
          (typeof data.fechaNacimiento === 'string' && data.fechaNacimiento ? data.fechaNacimiento : null) ||
          (typeof dataRecord.fecha_nacimiento === 'string' && dataRecord.fecha_nacimiento ? dataRecord.fecha_nacimiento : null) ||
          (typeof dataRecord.fechaNac === 'string' && dataRecord.fechaNac ? dataRecord.fechaNac : null);

        const sexo = data.sexo;

        if (nombres && apellidos && fechaNac && sexo) {
          const { beneficiariosQueries } = await import('@/lib/db/queries/beneficiarios.queries');

          // Verificar si existe algún beneficiario con esta cédula
          const beneficiarioExistente = await beneficiariosQueries.getByCedula(cedulaOriginal);

          if (beneficiarioExistente) {
            promises.push(beneficiariosQueries.updateBasicInfoByCedula(cedulaOriginal, nombres, apellidos, fechaNac, sexo, authResult.user.cedula));
          } else {
          }
        } else {
          logger.warn('[Sync Beneficiario] Campos faltantes:', {
            nombres: !!nombres,
            apellidos: !!apellidos,
            fechaNac: !!fechaNac,
            sexo: !!sexo,
            dataKeys: Object.keys(dataRecord)
          });
        }

        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (error) {
        logger.error('Error sincronizando datos de solicitante con usuarios/beneficiarios:', error);
      }
    }

    // Revalidar cache calculando rutas
    revalidatePath('/dashboard/applicants');
    revalidatePath(`/dashboard/applicants/${cedulaOriginal}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'updateSolicitanteAction', 'SOLICITANTE_ERROR');
  }
}


/**
 * Server Action para eliminar un solicitante
 */
export async function deleteSolicitanteAction(cedula: string, motivo: string): Promise<{ success: boolean; error?: unknown }> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return { success: false, error: authResult.error };
    }

    if (!cedula) {
      return { success: false, error: { message: 'Cédula requerida' } };
    }

    await solicitantesService.delete(cedula, authResult.user.cedula, motivo);

    revalidatePath('/dashboard/applicants');
    return { success: true };
  } catch (error) {
    return handleServerActionError(error, 'deleteSolicitanteAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para obtener solicitantes filtrados por núcleo
 */
export async function getSolicitantesByNucleoAction(nombreNucleo: string): Promise<GetSolicitantesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!nombreNucleo || nombreNucleo.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const rawResult = await solicitantesQueries.getByNucleo(nombreNucleo.trim());
    const result: SolicitanteListItem[] = rawResult.map((row: Record<string, unknown>) => ({
      cedula: String(row.cedula ?? ''),
      nombre_completo: String(row.nombre_completo ?? ''),
      telefono_celular: String(row.telefono_celular ?? ''),
      nucleo: row.nucleo !== undefined ? (row.nucleo as string | null) : null,
      fecha_solicitud: row.fecha_solicitud !== undefined ? (row.fecha_solicitud as string | null) : null,
      estado_civil: row.estado_civil !== undefined ? (row.estado_civil as string | null) : null,
      nacionalidad: row.nacionalidad !== undefined ? (row.nacionalidad as string | null) : null,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSolicitantesByNucleoAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para obtener solicitantes filtrados por estado civil
 */
export async function getSolicitantesByEstadoCivilAction(estadoCivil: string): Promise<GetSolicitantesResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!estadoCivil || estadoCivil.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const rawResult = await solicitantesQueries.getByEstadoCivil(estadoCivil.trim());
    const result: SolicitanteListItem[] = rawResult.map((row: Record<string, unknown>) => ({
      cedula: String(row.cedula ?? ''),
      nombre_completo: String(row.nombre_completo ?? ''),
      telefono_celular: String(row.telefono_celular ?? ''),
      nucleo: row.nucleo !== undefined ? (row.nucleo as string | null) : null,
      fecha_solicitud: row.fecha_solicitud !== undefined ? (row.fecha_solicitud as string | null) : null,
      estado_civil: row.estado_civil !== undefined ? (row.estado_civil as string | null) : null,
      nacionalidad: row.nacionalidad !== undefined ? (row.nacionalidad as string | null) : null,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSolicitantesByEstadoCivilAction', 'SOLICITANTE_ERROR');
  }
}

/**
 * Server Action para obtener solicitantes filtrados por nacionalidad
 */
export async function getSolicitantesByNacionalidadAction(nacionalidad: string): Promise<GetSolicitantesResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    if (!nacionalidad || nacionalidad.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const rawResult = await solicitantesQueries.getByNacionalidad(nacionalidad.trim());
    const result: SolicitanteListItem[] = rawResult.map((row: Record<string, unknown>) => ({
      cedula: String(row.cedula ?? ''),
      nombre_completo: String(row.nombre_completo ?? ''),
      telefono_celular: String(row.telefono_celular ?? ''),
      nucleo: row.nucleo !== undefined ? (row.nucleo as string | null) : null,
      fecha_solicitud: row.fecha_solicitud !== undefined ? (row.fecha_solicitud as string | null) : null,
      estado_civil: row.estado_civil !== undefined ? (row.estado_civil as string | null) : null,
      nacionalidad: row.nacionalidad !== undefined ? (row.nacionalidad as string | null) : null,
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSolicitantesByNacionalidadAction', 'SOLICITANTE_ERROR');
  }
}