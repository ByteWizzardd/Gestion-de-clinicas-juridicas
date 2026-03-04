'use server';

import { beneficiariosQueries } from '@/lib/db/queries/beneficiarios.queries';
import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { solicitantesQueries } from '@/lib/db/queries/solicitantes.queries';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/lib/utils/errors';
import { revalidatePath } from 'next/cache';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';

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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const beneficiarios = await beneficiariosQueries.searchByCedula(cedula);

    return {
      success: true,
      data: beneficiarios,
    };
  } catch (error) {
    return handleServerActionError(error, 'searchBeneficiariosByCedulaAction', 'BENEFICIARIO_ERROR');
  }
}

/**
 * Server Action para obtener un beneficiario completo por cédula
 */
export async function getBeneficiarioByCedulaAction(cedula: string): Promise<GetBeneficiarioByCedulaResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const beneficiario = await beneficiariosQueries.getByCedula(cedula);

    return {
      success: true,
      data: beneficiario,
    };
  } catch (error) {
    return handleServerActionError(error, 'getBeneficiarioByCedulaAction', 'BENEFICIARIO_ERROR');
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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar que la fecha de nacimiento no sea futura
    if (data.fecha_nac) {
      const dateToCheck = new Date(data.fecha_nac);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateToCheck > today) {
        return {
          success: false,
          error: {
            message: 'La fecha de nacimiento no puede ser una fecha futura',
            code: 'VALIDATION_ERROR'
          }
        };
      }
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

    const beneficiario = await beneficiariosQueries.create({
      ...data,
      id_usuario_registro: authResult.user.cedula
    });

    // Revalidar el detalle del caso para que se vea el nuevo beneficiario
    revalidatePath(`/dashboard/cases/${data.id_caso}`);

    return {
      success: true,
      data: beneficiario,
    };
  } catch (error) {
    return handleServerActionError(error, 'createBeneficiarioAction', 'BENEFICIARIO_CREATE_ERROR');
  }
}

/**
 * Server Action para actualizar un beneficiario existente
 */
export async function updateBeneficiarioAction(data: {
  id_caso: number;
  num_beneficiario: number;
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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar que la fecha de nacimiento no sea futura
    if (data.fecha_nac) {
      const dateToCheck = new Date(data.fecha_nac);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateToCheck > today) {
        return {
          success: false,
          error: {
            message: 'La fecha de nacimiento no puede ser una fecha futura',
            code: 'VALIDATION_ERROR'
          }
        };
      }
    }

    // Verificar si ya existe en este caso por cédula (si se proporcionó cédula)
    if (data.cedula) {
      const beneficiariosActuales = await beneficiariosQueries.getByCaso(data.id_caso);
      const yaExiste = beneficiariosActuales.some(b =>
        b.cedula === data.cedula && b.num_beneficiario !== data.num_beneficiario
      );
      if (yaExiste) {
        return {
          success: false,
          error: {
            message: 'Ya existe otro beneficiario con esta cédula en este caso',
            code: 'DUPLICATE_BENEFICIARY',
          },
        };
      }
    }




    const beneficiario = await beneficiariosQueries.update({
      ...data,
      id_usuario_actualizo: authResult.user.cedula
    });

    // Actualizar datos en usuarios y solicitantes si existen
    if (data.cedula) {
      // La actualización en usuarios y solicitantes no debe detener el flujo si falla
      // y si el registro no existe, simplemente no actualizará nada (0 rows affected)
      try {
        const actor = authResult.user.cedula;
        await Promise.all([
          usuariosQueries.updateBasicInfo(data.cedula, data.nombres, data.apellidos, actor),
          solicitantesQueries.updateBasicInfo(
            data.cedula,
            data.nombres,
            data.apellidos,
            data.fecha_nac,
            data.sexo,
            actor
          )
        ]);
      } catch (error) {
        logger.error('Error sincronizando datos de beneficiario con usuarios/solicitantes:', error);
        // No lanzamos error para nodetener la respuesta exitosa de la actualización del beneficiario
      }
    }

    // Revalidar el detalle del caso para que se vean los cambios
    revalidatePath(`/dashboard/cases/${data.id_caso}`);

    return {
      success: true,
      data: beneficiario,
    };
  } catch (error) {
    return handleServerActionError(error, 'updateBeneficiarioAction', 'BENEFICIARIO_UPDATE_ERROR');
  }
}

/**
 * Server Action para eliminar un beneficiario
 */
export async function deleteBeneficiarioAction(data: {
  id_caso: number;
  num_beneficiario: number;
  motivo: string;
}): Promise<{ success: boolean; data?: any; error?: { message: string; code?: string } }> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Validar motivo
    if (!data.motivo || data.motivo.trim() === '') {
      return {
        success: false,
        error: {
          message: 'El motivo de eliminación es obligatorio',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    const result = await beneficiariosQueries.delete(
      data.id_caso,
      data.num_beneficiario,
      authResult.user.cedula,
      data.motivo.trim()
    );

    // Revalidar el detalle del caso para que se vean los cambios
    revalidatePath(`/dashboard/cases/${data.id_caso}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleServerActionError(error, 'deleteBeneficiarioAction', 'BENEFICIARIO_DELETE_ERROR');
  }
}

