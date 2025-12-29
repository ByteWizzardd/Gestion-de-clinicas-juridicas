'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyToken } from '@/lib/utils/security';
import { estudiantesQueries } from '@/lib/db/queries/estudiantes.queries';
import { semestresQueries } from '@/lib/db/queries/semestres.queries';
import { bulkCreateEstudiantes, BulkUploadResult } from '@/lib/services/estudiantes.service';
import { AppError } from '@/lib/utils/errors';

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
    } catch {
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

    const estudiantes = await estudiantesQueries.searchByCedula(query.trim());

    return {
      success: true,
      data: estudiantes,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ESTUDIANTE_ERROR',
        },
      };
    }

    console.error('Error en searchEstudiantesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al buscar estudiantes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Server Action para obtener todos los semestres
 */
export async function getSemestresAction(): Promise<GetSemestresResult> {
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
    } catch {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    const semestres = await semestresQueries.getAll();

    return {
      success: true,
      data: semestres,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'SEMESTRE_ERROR',
        },
      };
    }

    console.error('Error en getSemestresAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener semestres',
        code: 'UNKNOWN_ERROR',
      },
    };
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
    } catch {
      return {
        success: false,
        error: {
          message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
          code: 'UNAUTHORIZED',
        },
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
    const result = await bulkCreateEstudiantes(file, term.trim(), tipoEstudiante);

    // Revalidar cache de la página de usuarios
    revalidatePath('/dashboard/users');

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
          code: error.code || 'BULK_UPLOAD_ERROR',
        },
      };
    }

    console.error('Error en bulkCreateEstudiantesAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al cargar estudiantes',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

