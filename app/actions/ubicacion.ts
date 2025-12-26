'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/utils/security';
import { estadosQueries } from '@/lib/db/queries/estados.queries';
import { municipiosQueries } from '@/lib/db/queries/municipios.queries';
import { parroquiasQueries } from '@/lib/db/queries/parroquias.queries';
import { AppError } from '@/lib/utils/errors';

export interface GetEstadosResult {
  success: boolean;
  data?: Array<{ id_estado: number; nombre_estado: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetMunicipiosResult {
  success: boolean;
  data?: Array<{ id_estado: number; num_municipio: number; nombre_municipio: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetParroquiasResult {
  success: boolean;
  data?: Array<{ id_estado: number; num_municipio: number; num_parroquia: number; nombre_parroquia: string }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getEstadosAction(): Promise<GetEstadosResult> {
  try {
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

    const estados = await estadosQueries.getAll();

    return {
      success: true,
      data: estados,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'ESTADOS_ERROR',
        },
      };
    }

    console.error('Error en getEstadosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener estados',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export async function getMunicipiosAction(idEstado: number): Promise<GetMunicipiosResult> {
  try {
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

    const municipios = await municipiosQueries.getByEstado(idEstado);

    return {
      success: true,
      data: municipios,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'MUNICIPIOS_ERROR',
        },
      };
    }

    console.error('Error en getMunicipiosAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener municipios',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

export async function getParroquiasAction(idEstado: number, numMunicipio: number): Promise<GetParroquiasResult> {
  try {
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

    const parroquias = await parroquiasQueries.getByMunicipio(idEstado, numMunicipio);

    return {
      success: true,
      data: parroquias,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'PARROQUIAS_ERROR',
        },
      };
    }

    console.error('Error en getParroquiasAction:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error al obtener parroquias',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

