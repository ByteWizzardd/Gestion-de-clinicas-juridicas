'use server';

import { estadosQueries } from '@/lib/db/queries/estados.queries';
import { municipiosQueries } from '@/lib/db/queries/municipios.queries';
import { parroquiasQueries } from '@/lib/db/queries/parroquias.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

export interface GetEstadosResult {
  success: boolean;
  data?: Array<{ id_estado: number; nombre_estado: string; habilitado?: boolean }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetMunicipiosResult {
  success: boolean;
  data?: Array<{ id_estado: number; num_municipio: number; nombre_municipio: string; habilitado?: boolean }>;
  error?: {
    message: string;
    code?: string;
  };
}

export interface GetParroquiasResult {
  success: boolean;
  data?: Array<{ id_estado: number; num_municipio: number; num_parroquia: number; nombre_parroquia: string; habilitado?: boolean }>;
  error?: {
    message: string;
    code?: string;
  };
}

export async function getEstadosAction(): Promise<GetEstadosResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const estados = await estadosQueries.getAll();

    return {
      success: true,
      data: estados,
    };
  } catch (error) {
    return handleServerActionError(error, 'getEstadosAction', 'ESTADOS_ERROR');
  }
}

export async function getMunicipiosAction(idEstado: number): Promise<GetMunicipiosResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const municipios = await municipiosQueries.getByEstado(idEstado);

    return {
      success: true,
      data: municipios,
    };
  } catch (error) {
    return handleServerActionError(error, 'getMunicipiosAction', 'MUNICIPIOS_ERROR');
  }
}

export async function getParroquiasAction(idEstado: number, numMunicipio: number): Promise<GetParroquiasResult> {
  try {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const parroquias = await parroquiasQueries.getByMunicipio(idEstado, numMunicipio);

    return {
      success: true,
      data: parroquias,
    };
  } catch (error) {
    return handleServerActionError(error, 'getParroquiasAction', 'PARROQUIAS_ERROR');
  }
}

