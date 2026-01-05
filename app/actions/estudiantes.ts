'use server';

import { revalidatePath } from 'next/cache';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes.queries';
import { semestresQueries } from '@/lib/db/queries/semestres.queries';
import { bulkCreateEstudiantes, BulkUploadResult } from '@/lib/services/estudiantes.service';
import { AppError, UnauthorizedError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface SearchEstudiantesResult {
  success: boolean;
  data?: unknown[];
  error?: {
    message: string;
    code?: string;
  };
}

export interface BulkCreateEstudiantesResult {
  success: boolean;
  data?: BulkUploadResult;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetSemestresResult {
  success: boolean;
  data?: Array<{
    term: string;
    fecha_inicio: Date;
    fecha_fin: Date;
  }>;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para buscar estudiantes por cédula
 */
export async function searchEstudiantesAction(query: string): Promise<SearchEstudiantesResult> {
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

    const estudiantes = await estudiantesQueries.searchByCedula(query.trim(), true);

    return {
      success: true,
      data: estudiantes,
    };
  } catch (error) {
    return handleServerActionError(error, 'searchEstudiantesAction', 'ESTUDIANTE_ERROR');
  }
}

/**
 * Server Action para obtener todos los semestres
 */
export async function getSemestresAction(): Promise<GetSemestresResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const semestres = await semestresQueries.getAll();

    return {
      success: true,
      data: semestres,
    };
  } catch (error) {
    return handleServerActionError(error, 'getSemestresAction', 'SEMESTRE_ERROR');
  }
}

/**
 * Server Action para obtener el semestre actual
 */
export interface GetCurrentTermResult {
  success: boolean;
  data?: { term: string };
  error?: { message: string; code?: string };
}

export async function getCurrentTermAction(): Promise<GetCurrentTermResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      } as GetCurrentTermResult;
    }

    const currentSemestre = await semestresQueries.getCurrent();

    if (!currentSemestre) {
      return {
        success: false,
        error: {
          message: 'No hay un semestre actual activo',
          code: 'NO_CURRENT_TERM',
        },
      };
    }

    return {
      success: true,
      data: { term: currentSemestre.term },
    };
  } catch (error) {
    return handleServerActionError(error, 'getCurrentTermAction', 'TERM_ERROR') as GetCurrentTermResult;
  }
}

/**
 * Server Action para cargar estudiantes por lotes desde CSV/Excel
 */
export async function bulkCreateEstudiantesAction(
  formData: FormData
): Promise<BulkCreateEstudiantesResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Obtener archivo y semestre del FormData
    const file = formData.get('file') as File;
    const term = formData.get('term') as string;
    const tipoEstudiante = (formData.get('tipoEstudiante') as string) || 'Inscrito';

    if (!file) {
      return {
        success: false,
        error: {
          message: 'No se proporcionó ningún archivo',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (!term || term.trim() === '') {
      return {
        success: false,
        error: {
          message: 'Debe seleccionar un semestre',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Procesar archivo
    const result = await bulkCreateEstudiantes(file, term.trim(), authResult.user.cedula, tipoEstudiante);

    // Revalidar cache de la página de usuarios
    revalidatePath('/dashboard/users');

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'bulkCreateEstudiantesAction', 'BULK_UPLOAD_ERROR');
  }
}

