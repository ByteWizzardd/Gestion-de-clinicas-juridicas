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
    ipDireccion?: string;
    dispositivo?: string;
  }) => {
    // Validaciones
    if (!data.nombreUsuario || !data.password) {
      throw new ValidationError('Nombre de usuario y contraseña son requeridos');
    }

    // Buscar usuario por nombre_usuario
    const user = await authQueries.getUserByNombreUsuario(data.nombreUsuario);

    // Si no existe el usuario, registramos un intento fallido (si podemos identificarlo por nombre de usuario, 
    // pero aquí no tenemos la cédula si no existe. Podríamos registrar el nombre de usuario intentado si cambiamos el esquema,
    // pero por ahora solo registramos si el usuario existe pero la clave falla)
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar si el usuario está habilitado
    if (!user.habilitado) {
      await authQueries.registrarInicioSesion({
        cedula: user.cedula,
        ipDireccion: data.ipDireccion,
        dispositivo: data.dispositivo,
        exitoso: false
      });
      throw new UnauthorizedError('Usuario deshabilitado. Contacte al administrador');
    }

    // Verificar contraseña
    if (!user.password_hash) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const passwordMatch = await comparePassword(data.password, user.password_hash);

    if (!passwordMatch) {
      // Registrar intento fallido
      await authQueries.registrarInicioSesion({
        cedula: user.cedula,
        ipDireccion: data.ipDireccion,
        dispositivo: data.dispositivo,
        exitoso: false
      });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken(user.cedula, user.rol_sistema);

    // Registrar inicio de sesión exitoso
    const idSesion = await authQueries.registrarInicioSesion({
      cedula: user.cedula,
      ipDireccion: data.ipDireccion,
      dispositivo: data.dispositivo,
      exitoso: true
    });

    return {
      user: {
        cedula: user.cedula,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo_electronico,
        rol: user.rol_sistema,
      },
      token,
      idSesion, // Retornamos el id de sesión para poder cerrarlo luego si es necesario
    };
  },
};