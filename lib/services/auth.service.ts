import { authQueries } from '@/lib/db/queries/auth.queries';
import { hashPassword, comparePassword, generateToken } from '@/lib/utils/security';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/utils/errors';

/**
 * Servicio de autenticación
 * Contiene la lógica de negocio para login
 */
export const authService = {
  /**
   * Inicia sesión de un usuario
   */
  login: async (data: {
    nombreUsuario: string;
    password: string;
  }) => {
    // Validaciones
    if (!data.nombreUsuario || !data.password) {
      throw new ValidationError('Nombre de usuario y contraseña son requeridos');
    }

    // Buscar usuario por nombre_usuario
    const user = await authQueries.getUserByNombreUsuario(data.nombreUsuario);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar si el usuario está habilitado
    if (!user.habilitado) {
      throw new UnauthorizedError('Usuario deshabilitado. Contacte al administrador');
    }

    // Verificar contraseña
    if (!user.password_hash) {
      throw new UnauthorizedError('Usuario sin contraseña configurada');
    }

    const passwordMatch = await comparePassword(data.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.cedula, user.rol_sistema);

    return {
      user: {
        cedula: user.cedula,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo_electronico,
        rol: user.rol_sistema,
      },
      token,
    };
  },
};