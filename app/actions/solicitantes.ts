'use server';

import { solicitantesService } from '@/lib/services/solicitantes.service';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { SolicitantesService } from '@/lib/services/solicitantes.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface CreateSolicitanteResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
    fields?: Record<string, string[]>;
  };
}

export interface GetSolicitantesResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetSolicitanteByIdResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

export interface SearchSolicitantesResult {
  success: boolean;
  data?: any[];
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
export async function createSolicitanteAction(data: any): Promise<CreateSolicitanteResult> {
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

    console.error('Error en getSolicitantesAction:', error);
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
  email: string
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

    const result = await solicitantesQueries.checkEmailExists(email.trim());

    return {
      success: true,
      exists: result !== null,
      data: result || undefined,
    };
  } catch (error) {
    console.error('Error en checkEmailExistsAction:', error);
    return {
      success: false,
      exists: false,
    };
  }
}

/**
 * Server Action para actualizar un solicitante existente
 */
export async function updateSolicitanteAction(cedulaOriginal: string, data: any): Promise<CreateSolicitanteResult> {
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
        if (data.nombres && data.apellidos && data.correoElectronico) {
          const telefono = data.telefonoCelular || '';
          const { usuariosQueries } = await import('@/lib/db/queries/usuarios.queries');
          promises.push(usuariosQueries.updateContactInfo(cedulaOriginal, data.nombres, data.apellidos, data.correoElectronico, telefono, authResult.user.cedula));
        }

        // Actualizar beneficiario - verificar campos con diferentes posibles nombres
        const nombres = data.nombres;
        const apellidos = data.apellidos;
        const fechaNac = data.fechaNacimiento || data.fecha_nacimiento || data.fechaNac;
        const sexo = data.sexo;

        console.log('[Sync Beneficiario] Intentando sincronizar con cédula:', cedulaOriginal);
        console.log('[Sync Beneficiario] Datos disponibles:', { nombres, apellidos, fechaNac, sexo });

        if (nombres && apellidos && fechaNac && sexo) {
          const { beneficiariosQueries } = await import('@/lib/db/queries/beneficiarios.queries');

          // Verificar si existe algún beneficiario con esta cédula
          const beneficiarioExistente = await beneficiariosQueries.getByCedula(cedulaOriginal);
          console.log('[Sync Beneficiario] Beneficiario encontrado:', beneficiarioExistente ? 'Sí' : 'No');

          if (beneficiarioExistente) {
            promises.push(beneficiariosQueries.updateBasicInfoByCedula(cedulaOriginal, nombres, apellidos, fechaNac, sexo, authResult.user.cedula));
            console.log('[Sync Beneficiario] Actualización programada para cédula:', cedulaOriginal);
          } else {
            console.log('[Sync Beneficiario] No existe beneficiario con cédula:', cedulaOriginal, '- No se actualizará');
          }
        } else {
          console.warn('[Sync Beneficiario] Campos faltantes:', {
            nombres: !!nombres,
            apellidos: !!apellidos,
            fechaNac: !!fechaNac,
            sexo: !!sexo,
            dataKeys: Object.keys(data)
          });
        }

        if (promises.length > 0) {
          await Promise.all(promises);
          console.log('[Sync Beneficiario] Sincronización completada');
        }
      } catch (error) {
        console.error('Error sincronizando datos de solicitante con usuarios/beneficiarios:', error);
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
export async function deleteSolicitanteAction(cedula: string, motivo: string): Promise<{ success: boolean; error?: any }> {
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
