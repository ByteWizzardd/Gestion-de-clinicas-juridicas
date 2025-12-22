'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { clientesQueries } from '@/lib/db/queries/clientes/clientes.queries';
import { ClientesService } from '@/lib/services/clientes/clientes.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';

export interface SearchClientesResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetClienteByCedulaResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar clientes por cédula
 * @param query - Término de búsqueda (cédula)
 * @param excludeSolicitantes - Si es true, excluye clientes que son solicitantes
 */
export async function searchClientesAction(
  query: string,
  excludeSolicitantes: boolean = false
): Promise<SearchClientesResult> {
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

    let clientes;
    if (excludeSolicitantes) {
      // Buscar excluyendo solicitantes (para recomendaciones)
      clientes = await clientesQueries.searchByCedulaExcludeSolicitantes(query.trim());
    } else {
      // Búsqueda normal (incluye todos los clientes)
      clientes = await clientesQueries.searchByCedula(query.trim());
    }

    return {
      success: true,
      data: clientes,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CLIENTE_ERROR',
        },
      };
    }

    console.error('Error en searchClientesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar clientes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener un cliente completo por cédula
 */
export async function getClienteByCedulaAction(cedula: string): Promise<GetClienteByCedulaResult> {
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
          message: 'Cédula del cliente es requerida',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const cliente = await ClientesService.getClienteCompleto(cedula);

    if (!cliente) {
      return {
        success: false,
        error: {
          message: 'Cliente no encontrado',
          code: 'NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'CLIENTE_ERROR',
        },
      };
    }

    console.error('Error en getClienteByCedulaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener cliente',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

