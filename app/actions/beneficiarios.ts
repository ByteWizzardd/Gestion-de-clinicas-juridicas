'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { AppError } from '@/lib/utils/errors';

export interface SearchBeneficiariosResult {
  success: boolean;
  data?: Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string | null;
    sexo: string;
    nombre_completo: string;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetBeneficiarioByCedulaResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string | null;
    sexo: string;
    nombre_completo: string;
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar beneficiarios por cédula
 */
export async function searchBeneficiariosByCedulaAction(cedula: string): Promise<SearchBeneficiariosResult> {
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

    const beneficiarios = await beneficiariosQueries.searchByCedula(cedula);

    return {
      success: true,
      data: beneficiarios,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'BENEFICIARIO_ERROR',
        },
      };
    }

    console.error('Error en searchBeneficiariosByCedulaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar beneficiarios',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener un beneficiario completo por cédula
 */
export async function getBeneficiarioByCedulaAction(cedula: string): Promise<GetBeneficiarioByCedulaResult> {
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

    const beneficiario = await beneficiariosQueries.getByCedula(cedula);

    return {
      success: true,
      data: beneficiario,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'BENEFICIARIO_ERROR',
        },
      };
    }

    console.error('Error en getBeneficiarioByCedulaAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener beneficiario',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

