'use server';

import { ambitosLegalesQueries } from '@/lib/db/queries/ambitos-legales.queries';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetAmbitosLegalesResult {
  success: boolean;
  data?: any[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para obtener todos los ámbitos legales
 */
export async function getAmbitosLegalesAction(): Promise<GetAmbitosLegalesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const ambitos = await ambitosLegalesQueries.getAll();

    return {
      success: true,
      data: ambitos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getAmbitosLegalesAction', 'AMBITO_LEGAL_ERROR');
  }
}

/**
 * Server Action para obtener ámbitos legales por materia, categoría y subcategoría
 */
export async function getAmbitosLegalesByMateriaCategoriaSubcategoriaAction(
  idMateria: number,
  numCategoria: number,
  numSubcategoria: number
): Promise<GetAmbitosLegalesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const ambitos = await ambitosLegalesQueries.getByMateriaCategoriaSubcategoria(
      idMateria,
      numCategoria,
      numSubcategoria
    );

    return {
      success: true,
      data: ambitos,
    };
  } catch (error) {
    return handleServerActionError(error, 'getAmbitosLegalesByMateriaCategoriaSubcategoriaAction', 'AMBITO_LEGAL_ERROR');
  }
}

