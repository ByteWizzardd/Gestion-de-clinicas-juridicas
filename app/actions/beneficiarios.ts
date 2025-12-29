'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { AppError } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';

export interface SearchBeneficiariosResult {
  success: boolean;
  data?: Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string | null;
    sexo: string | null;
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
    sexo: string | null;
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

/**
 * Server Action para crear un nuevo beneficiario asociado a un caso
 */
export async function createBeneficiarioAction(data: {
  id_caso: number;
  cedula?: string | null;
  nombres: string;
  apellidos: string;
  fecha_nac: string;
  sexo: string;
  tipo_beneficiario: string;
  parentesco: string;
}): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string } }> {
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

    // Verificar si ya existe en este caso por cédula
    if (data.cedula) {
      const beneficiariosActuales = await beneficiariosQueries.getByCaso(data.id_caso);
      const yaExiste = beneficiariosActuales.some(b => b.cedula === data.cedula);
      if (yaExiste) {
        return {
          success: false,
          error: {
            message: 'Este beneficiario ya está registrado en este caso',
            code: 'DUPLICATE_BENEFICIARY',
          },
        };
      }
    }

    const beneficiario = await beneficiariosQueries.create(data);

    // Revalidar el detalle del caso para que se vea el nuevo beneficiario
    revalidatePath(`/dashboard/cases/${data.id_caso}`);

    return {
      success: true,
      data: beneficiario,
    };
  } catch (error) {
    console.error('Error en createBeneficiarioAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al registrar beneficiario',
        code: 'BENEFICIARIO_CREATE_ERROR',
      },
    };
  }
}

