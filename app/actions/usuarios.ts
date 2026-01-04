'use server';

import { usuariosQueries } from '@/lib/db/queries/usuarios.queries';
import { AppError } from '@/lib/utils/errors';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { handleServerActionError } from '@/lib/utils/server-action-helpers';
import { getCurrentUserAction } from "./auth";
export interface GetUsuarioCompleteByCedulaResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono_celular: string | null;
    nombre_completo: string;
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

/**
* Server Action para obtener un usuario completo por cédula
*/

export async function getUsuarioCompleteByCedulaAction(
  cedula: string
): Promise<GetUsuarioCompleteByCedulaResult> {
  try {
    // 1. Obtener usuario actor y validar rol
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }

    if (userResult.data.rol !== "Coordinador") {
      return {
        success: false,
        error: {
          message: "Acceso denegado. Permiso insuficiente.",
          code: "FORBIDDEN",
        },
      };
    }
    const usuario = await usuariosQueries.getCompleteByCedula(cedula);
    return {
      success: true,
      data: usuario,
    };
  } catch (error) {
    return handleServerActionError(error, 'getUsuarioCompleteByCedulaAction', 'USUARIO_ERROR');
  }
}
export interface GetUsuariosResult {
  success: boolean;
  data?: Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    info_estudiante: string | null;
    info_profesor: string | null;
    info_coordinador: string | null;
  }>;

  error?: {
    message: string;
    code?: string;
  };
}

/**
* Server Action para obtener todos los usuarios
*/

export async function getUsuariosAction(): Promise<GetUsuariosResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const usuarios = await usuariosQueries.getAll();
    return {
      success: true,
      data: usuarios,
    };
  } catch (error) {
    return handleServerActionError(error, 'getUsuariosAction', 'USUARIO_ERROR');
  }
}

// Toggle habilitado usuario result interface

export interface toggleHabilitadoUsuarioResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

/**
* Server Action para alternar el estado habilitado de un usuario
*/

export async function toggleHabilitadoUsuarioAction(
  cedula: string
): Promise<toggleHabilitadoUsuarioResult> {
  try {
    // 1. Obtener usuario actor y validar rol
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }
    if (userResult.data.rol !== "Coordinador") {
      return {
        success: false,
        error: {
          message: "Acceso denegado. Permiso insuficiente.",
          code: "FORBIDDEN",
        },
      };
    }
    const cedula_actor = userResult.data.cedula;
    return await usuariosQueries.toggleHabilitado(cedula, cedula_actor);
  } catch (error: unknown) {
    return {
      success: false,
      error: {
        message: (error as Error).message,
        code: (error as Error & { code?: string }).code,
      },
    };
  }
}

export async function deleteUsuarioFisicoAction(
  cedula_usuario: string,
  motivo: string
): Promise<{ success: boolean; error?: { message: string } }> {
  if (!motivo || motivo.trim() === "") {
    return {
      success: false,
      error: { message: "El motivo es obligatorio para eliminar un usuario" },
    };
  }
  // 1. Obtener usuario actor desde la cookie JWT
  const userResult = await getCurrentUserAction();
  if (!userResult.success || !userResult.data) {
    return {
      success: false,
      error: { message: "No se pudo determinar el usuario actor" },
    };
  }
  // 2. Validar que sea coordinador
  if (userResult.data.rol !== "Coordinador") {
    return {
      success: false,
      error: {
        message:
          "Solo los coordinadores pueden eliminar usuarios permanentemente.",
      },
    };
  }
  try {
    // 3. Ejecutar la eliminación física
    await usuariosQueries.deleteFisico(
      cedula_usuario,
      userResult.data.cedula,
      motivo
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Error al eliminar usuario",
      },
    };
  }
}
//*
// Obtener información de un usuario por cédula
//
export interface GetUsuarioInfoByCedulaResult {
  success: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    estudiante?: {
      nrc: string | null;
      term: string | null;
      tipo_estudiante:
        | "Voluntario"
        | "Inscrito"
        | "Egresado"
        | "Servicio Comunitario"
        | null;
    };
    profesor?: {
      term: string | null;
      tipo_profesor: string | null;
    };
    coordinador?: {
      term: string | null;
    };
  } | null;

  error?: {
    message: string;
    code?: string;
  };
}
/**
* Server Action para obtener la información completa de un usuario por cédula
*/
export async function getUsuarioInfoByCedulaAction(
  cedula: string
): Promise<GetUsuarioInfoByCedulaResult> {
  try {
    // 1. Obtener usuario actor y validar rol
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }
    if (userResult.data.rol !== "Coordinador") {
      return {
        success: false,
        error: {
          message: "Acceso denegado. Permiso insuficiente.",
          code: "FORBIDDEN",
        },
      };
    }
    const usuario = await usuariosQueries.getInfoByCedula(cedula);
    return {
      success: true,
      data: usuario,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || "USUARIO_ERROR",
        },
      };
    }
    console.error("Error en getUsuarioInfoByCedulaAction:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error ? error.message : "Error al obtener usuario",

        code: "UNKNOWN_ERROR",
      },
    };
  }
}
/**
 * Server Action para verificar si un correo electrónico ya existe en usuarios
 */
export interface CheckEmailExistsResult {
  success: boolean;
  exists: boolean;
  data?: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
  } | null;
  error?: {
    message: string;
    code?: string;
  };
}

export async function checkEmailExistsUsuarioAction(
  email: string
): Promise<CheckEmailExistsResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        exists: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }

    if (!email || email.trim().length === 0) {
      return {
        success: true,
        exists: false,
      };
    }

    const result = await usuariosQueries.searchByEmail(email.trim());
    
    return {
      success: true,
      exists: result.length > 0,
      data: result.length > 0 ? result[0] : null,
    };
  } catch (error) {
    console.error('Error en checkEmailExistsUsuarioAction:', error);
    return {
      success: false,
      exists: false,
      error: {
        message: error instanceof Error ? error.message : "Error al verificar correo",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

// Server Action para actualizar un usuario por cédula
export interface UpdateUsaruiobyCedulaResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

export async function updateUsuarioByCedulaAction(
  cedula: string,

  updates: {
    correo_electronico?: string;
    nombre?: string;
    apellidos?: string;
    nombre_usuario?: string;
    tipo_usuario?: string;
    habilitado_sistema?: boolean;
    telefono?: string;
    estudiante?: {
      tipo_estudiante?:
        | "Voluntario"
        | "Inscrito"
        | "Egresado"
        | "Servicio Comunitario"
        | null;
      nrc?: string | null;
      term?: string | null;
    };
    profesor?: {
      tipo_profesor?: "Voluntario" | "Asesor" | null;
      term: string | null;
    };
    coordinador?: {
      term: string | null;
    };
  }
): Promise<UpdateUsaruiobyCedulaResult> {
  try {
    // 1. Obtener usuario actor y validar rol
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }
    if (userResult.data.rol !== "Coordinador") {
      return {
        success: false,
        error: {
          message: "Acceso denegado. Permiso insuficiente.",
          code: "FORBIDDEN",
        },
      };
    }
    const cedula_actor = userResult.data.cedula;
    
    // Obtener el tipo_usuario actual del usuario para determinar qué valores pasar
    const usuarioActual = await usuariosQueries.getInfoByCedula(cedula);
    const tipoUsuarioActual = usuarioActual?.tipo_usuario || null;
    
    // Usar el tipo_usuario que se está pasando, o el actual si no se pasa
    const tipoUsuarioParaValores = (updates.tipo_usuario && updates.tipo_usuario.trim() !== '') 
      ? updates.tipo_usuario 
      : tipoUsuarioActual;
    
    await usuariosQueries.updateUsuarioByCedulaAction({
      cedula,
      nombres: updates.nombre ?? "",
      apellidos: updates.apellidos ?? "",
      correo_electronico: updates.correo_electronico ?? "",
      nombre_usuario: updates.nombre_usuario ?? "",
      telefono_celular: updates.telefono ?? null,
      tipo_usuario: (updates.tipo_usuario && updates.tipo_usuario.trim() !== '') ? updates.tipo_usuario : (tipoUsuarioActual || ""),
      nrc: tipoUsuarioParaValores === "Estudiante" ? updates.estudiante?.nrc ?? null : null,
      term:
        tipoUsuarioParaValores === "Estudiante"
          ? updates.estudiante?.term ?? null
          : tipoUsuarioParaValores === "Profesor"
          ? updates.profesor?.term ?? null
          : tipoUsuarioParaValores === "Coordinador"
          ? updates.coordinador?.term ?? null
          : null,
      tipo_estudiante: tipoUsuarioParaValores === "Estudiante" ? (updates.estudiante?.tipo_estudiante ?? null) : null,
      tipo_profesor: tipoUsuarioParaValores === "Profesor" ? (updates.profesor?.tipo_profesor ?? null) : null,
      cedula_actor,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,

        error: {
          message: error.message,

          code: error.code || "USUARIO_ERROR",
        },
      };
    }
    console.error("Error en updateUsuarioByCedulaAction:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export interface CreateUsuarioResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para crear un nuevo usuario
 */
export async function createUsuarioAction(
  data: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    contrasena: string;
    telefono?: string | null;
    tipo_usuario: string;
    estudiante?: {
      nrc?: string | null;
      term?: string | null;
      tipo_estudiante?: string | null;
    };
    profesor?: {
      term?: string | null;
      tipo_profesor?: string | null;
    };
    coordinador?: {
      term?: string | null;
    };
  }
): Promise<CreateUsuarioResult> {
  try {
    // 1. Obtener usuario actor y validar rol
    const userResult = await getCurrentUserAction();
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: { message: "No autorizado", code: "UNAUTHORIZED" },
      };
    }
    if (userResult.data.rol !== "Coordinador") {
      return {
        success: false,
        error: {
          message: "Acceso denegado. Solo los coordinadores pueden crear usuarios.",
          code: "FORBIDDEN",
        },
      };
    }
    const cedula_actor = userResult.data.cedula;

    // 2. Hash de la contraseña
    const { hashPassword } = await import('@/lib/utils/security');
    const passwordHash = await hashPassword(data.contrasena);

    // 3. Crear el usuario
    await usuariosQueries.createUser({
      cedula: data.cedula,
      nombres: data.nombres,
      apellidos: data.apellidos,
      correo_electronico: data.correo_electronico,
      nombre_usuario: data.nombre_usuario,
      contrasena: passwordHash,
      telefono_celular: data.telefono,
      tipo_usuario: data.tipo_usuario,
      estudiante: data.estudiante,
      profesor: data.profesor,
      coordinador: data.coordinador,
      cedula_actor,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code || "USUARIO_ERROR",
        },
      };
    }
    console.error("Error en createUsuarioAction:", error);
    return {
      success: false,
      error: {
        message:
          error instanceof Error
            ? error.message
            : "Error al crear usuario",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

export interface UploadFotoPerfilResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para subir/actualizar foto de perfil
 */
export async function uploadFotoPerfilAction(
  formData: FormData
): Promise<UploadFotoPerfilResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedula = authResult.user.cedula;
    const file = formData.get('foto') as File | null;

    if (!file) {
      return {
        success: false,
        error: {
          message: 'No se proporcionó ningún archivo',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: {
          message: 'Formato de archivo no permitido. Solo se permiten: JPG, PNG, WEBP',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: {
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Actualizar foto de perfil en la base de datos
    await usuariosQueries.updateFotoPerfil(cedula, buffer);

    return {
      success: true,
    };
  } catch (error) {
    return handleServerActionError(error, 'uploadFotoPerfilAction', 'UPLOAD_ERROR');
  }
}

/**
 * Server Action para eliminar foto de perfil del usuario actual
 */
export async function deleteFotoPerfilAction(): Promise<DeleteFotoPerfilResult> {
  try {
    // Verificar autenticación
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    const cedula = authResult.user.cedula;

    // Eliminar foto de perfil (establecer a NULL)
    await usuariosQueries.deleteFotoPerfil(cedula);

    return {
      success: true,
    };
  } catch (error) {
    return handleServerActionError(error, 'deleteFotoPerfilAction', 'DELETE_ERROR');
  }
}

/**
 * Server Action para subir foto de perfil de otro usuario (solo coordinador)
 */
export async function uploadFotoPerfilUsuarioAction(
  formData: FormData
): Promise<UploadFotoPerfilResult> {
  try {
    // Verificar autenticación y rol
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Solo coordinador puede subir fotos de otros usuarios
    const userResult = await getCurrentUserAction();
    if (!userResult.success || userResult.data?.rol !== 'Coordinador') {
      return {
        success: false,
        error: {
          message: 'No tienes permisos para realizar esta acción',
          code: 'FORBIDDEN',
        },
      };
    }

    const cedula = formData.get('cedula') as string;
    const file = formData.get('foto') as File | null;

    if (!cedula) {
      return {
        success: false,
        error: {
          message: 'No se proporcionó la cédula del usuario',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    if (!file) {
      return {
        success: false,
        error: {
          message: 'No se proporcionó ningún archivo',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: {
          message: 'Formato de archivo no permitido. Solo se permiten: JPG, PNG, WEBP',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: {
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Actualizar foto de perfil en la base de datos
    await usuariosQueries.updateFotoPerfil(cedula, buffer);

    return {
      success: true,
    };
  } catch (error) {
    return handleServerActionError(error, 'uploadFotoPerfilUsuarioAction', 'UPLOAD_ERROR');
  }
}

export interface DeleteFotoPerfilResult {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Server Action para eliminar foto de perfil de otro usuario (solo coordinador)
 */
export async function deleteFotoPerfilUsuarioAction(
  cedula: string
): Promise<DeleteFotoPerfilResult> {
  try {
    // Verificar autenticación y rol
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
      return {
        success: false,
        error: authResult.error!,
      };
    }

    // Solo coordinador puede eliminar fotos de otros usuarios
    const userResult = await getCurrentUserAction();
    if (!userResult.success || userResult.data?.rol !== 'Coordinador') {
      return {
        success: false,
        error: {
          message: 'No tienes permisos para realizar esta acción',
          code: 'FORBIDDEN',
        },
      };
    }

    if (!cedula) {
      return {
        success: false,
        error: {
          message: 'No se proporcionó la cédula del usuario',
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Eliminar foto de perfil (establecer a NULL)
    await usuariosQueries.deleteFotoPerfil(cedula);

    return {
      success: true,
    };
  } catch (error) {
    return handleServerActionError(error, 'deleteFotoPerfilUsuarioAction', 'DELETE_ERROR');
  }
}
