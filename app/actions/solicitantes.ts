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

    const result = await solicitantesService.create(data);

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

