'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { solicitantesService } from '@/lib/services/solicitantes.service';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { clientesQueries } from '@/lib/db/queries/clientes.queries';
import { ClientesService } from '@/lib/services/clientes.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

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
 */
export async function createSolicitanteAction(data: any): Promise<CreateSolicitanteResult> {
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

    // Verificar token (opcional, pero recomendado para validar sesión)
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

    const result = await solicitantesService.create(data);

    // Revalidar cache de la página de solicitantes
    revalidatePath('/dashboard/applicants');

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
          fields: (error as any).fields,
        },
      };
    }

    console.error('Error en createSolicitanteAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al crear solicitante',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener todos los solicitantes
 */
export async function getSolicitantesAction(): Promise<GetSolicitantesResult> {
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

    if (!cedula) {
      return {
        success: false,
        error: {
          message: 'Cédula del solicitante es requerida',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const solicitante = await ClientesService.getClienteCompleto(cedula);

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
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'SOLICITANTE_ERROR',
        },
      };
    }

    console.error('Error en getSolicitanteByIdAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener solicitante',
        code: 'UNKNOWN_ERROR',
      },
    };
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

    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    let resultados;
    if (type === 'email') {
      // Buscar en clientes directamente, no solo en solicitantes
      resultados = await clientesQueries.searchByEmail(query.trim());
    } else {
      // type === 'cedula' (por defecto)
      resultados = await solicitantesQueries.searchByCedula(query.trim());
    }

    return {
      success: true,
      data: resultados,
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

    console.error('Error en searchSolicitantesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar solicitantes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

