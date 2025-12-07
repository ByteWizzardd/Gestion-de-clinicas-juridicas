import { authQueries } from '@/lib/db/queries/auth/auth.queries';
import { hashPassword, comparePassword, generateToken } from '@/lib/utils/security';
import { AppError, ValidationError, NotFoundError, UnauthorizedError } from '@/lib/utils/errors';

/**
 * Servicio de autenticación
 * Contiene la lógica de negocio para login y registro
 */
export const authService = {
  /**
   * Registra un nuevo usuario
   * Crea primero el cliente si no existe, luego el usuario
   */
  register: async (data: {
    cedula: string;
    correo: string;
    password: string;
    confirmPassword: string;
    nombreCompleto: string;
    telefonoCelular?: string;
    fechaNacimiento?: string;
    sexo?: 'M' | 'F';
    nacionalidad?: 'V' | 'E' | 'Ext';
    rolSistema?: 'Estudiante' | 'Profesor' | 'Coordinador';
  }) => {
    // Validaciones
    if (!data.cedula || !data.correo || !data.password) {
      throw new ValidationError('Todos los campos son requeridos');
    }

    if (data.password !== data.confirmPassword) {
      throw new ValidationError('Las contraseñas no coinciden');
    }

    if (data.password.length < 6) {
      throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el usuario ya existe
    let existingUser;
    try {
      existingUser = await authQueries.getUserByCedula(data.cedula);
    } catch (error) {
      // Si hay error de conexión, lanzarlo
      throw error;
    }
    
    if (existingUser && existingUser.password_hash) {
      throw new ValidationError('Ya existe un usuario con esta cédula');
    }

    // Verificar si el correo ya está en uso
    let existingEmail;
    try {
      existingEmail = await authQueries.getUserByEmail(data.correo);
    } catch (error) {
      // Si hay error de conexión, lanzarlo
      throw error;
    }
    
    if (existingEmail && existingEmail.password_hash) {
      throw new ValidationError('Ya existe un usuario con este correo');
    }

    // Dividir nombre completo en nombres y apellidos
    const partesNombre = data.nombreCompleto.trim().split(' ');
    const nombres = partesNombre.slice(0, Math.ceil(partesNombre.length / 2)).join(' ') || data.nombreCompleto;
    const apellidos = partesNombre.slice(Math.ceil(partesNombre.length / 2)).join(' ') || nombres;

    // Valores por defecto para campos requeridos del cliente
    const telefonoCelular = data.telefonoCelular || '0000-0000000';
    const fechaNacimiento = data.fechaNacimiento || '1990-01-01';
    const sexo = data.sexo || 'M';
    const nacionalidad = data.nacionalidad || 'V';

    // Crear o actualizar cliente primero
    await authQueries.createCliente({
      cedula: data.cedula,
      nombres,
      apellidos,
      correoElectronico: data.correo,
      telefonoCelular,
      fechaNacimiento,
      sexo,
      nacionalidad,
    });

    // Hash de la contraseña
    const passwordHash = await hashPassword(data.password);

    // Determinar rol según el dominio del correo
    // Si el correo tiene "est." al inicio del dominio → Estudiante
    // Si no tiene "est." al inicio del dominio → Profesor
    let rolSistema: 'Estudiante' | 'Profesor' | 'Coordinador';
    
    if (data.rolSistema) {
      // Si se especifica un rol manualmente, usarlo
      rolSistema = data.rolSistema;
    } else {
      // Extraer el dominio del correo
      const emailDomain = data.correo.split('@')[1]?.toLowerCase() || '';
      
      // Verificar si el dominio comienza con "est." (ej: est.ucab.edu.ve)
      if (emailDomain.startsWith('est.')) {
        rolSistema = 'Estudiante';
      } else {
        rolSistema = 'Profesor';
      }
    }
    
    const user = await authQueries.createUser({
      cedula: data.cedula,
      passwordHash,
      rolSistema,
    });

    // Generar token
    const token = generateToken(user.cedula, user.rol_sistema);

    return {
      user: {
        cedula: user.cedula,
        rol: user.rol_sistema,
      },
      token,
    };
  },

  /**
   * Inicia sesión de un usuario
   */
  login: async (data: {
    correo: string;
    password: string;
  }) => {
    // Validaciones
    if (!data.correo || !data.password) {
      throw new ValidationError('Correo y contraseña son requeridos');
    }

    // Buscar usuario por correo
    const user = await authQueries.getUserByEmail(data.correo);
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

