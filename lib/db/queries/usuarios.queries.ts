import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';
import { estudiantesQueries } from './estudiantes.queries';
import { profesoresQueries } from './profesores.queries';

/**
 * Queries para la entidad Usuarios
 * Todas las queries SQL están en database/queries/usuarios/
 */
export const usuariosQueries = {
  /**
   * Busca usuarios por cédula (búsqueda parcial)
   * Busca en la tabla usuarios (estudiantes, profesores, coordinadores)
   * @param habilitadosOnly Si es true, solo devuelve usuarios habilitados
   */
  searchByCedula: async (
    cedula: string,
    habilitadosOnly: boolean = false
  ): Promise<
    Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
    }>
  > => {
    let query = loadSQL("usuarios/search-by-cedula.sql");
    if (habilitadosOnly) {
      // search-by-cedula.sql has a WHERE clause, so we append AND
      const parts = query.split('ORDER BY');
      if (parts.length > 1) {
        query = parts[0] + 'AND u.habilitado_sistema = true ORDER BY' + parts[1];
      }
    }
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca usuarios por cédula excluyendo solicitantes (para recomendaciones)
   */
  searchByCedulaExcludeSolicitantes: async (
    cedula: string
  ): Promise<
    Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      telefono_celular: string;
      correo_electronico: string;
      nombre_completo: string;
    }>
  > => {
    const query = loadSQL("usuarios/search-by-cedula-exclude-solicitantes.sql");
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca usuarios por correo electrónico (búsqueda exacta)
   */
  searchByEmail: async (
    email: string
  ): Promise<
    Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      correo_electronico: string;
      nombre_completo: string;
    }>
  > => {
    const query = loadSQL("usuarios/search-by-email.sql");
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows;
  },

  /**
   * Busca usuarios por nombre_usuario (búsqueda exacta)
   */
  searchByUsername: async (
    username: string
  ): Promise<
    Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      nombre_usuario: string;
      nombre_completo: string;
    }>
  > => {
    const query = loadSQL("usuarios/search-by-username.sql");
    const result: QueryResult = await pool.query(query, [username]);
    return result.rows;
  },

  /**
   * Obtiene un usuario completo por cédula con todos los campos necesarios para autocompletar
   */
  getCompleteByCedula: async (
    cedula: string
  ): Promise<{
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    telefono_celular: string | null;
    nombre_completo: string;
  } | null> => {
    const query = loadSQL("usuarios/get-complete-by-cedula.sql");
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows[0] || null;
  },

  /**
   * Crea o actualiza un usuario
   */
  createOrUpdate: async (data: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    contrasena: string;
    telefono_celular?: string | null;
  }): Promise<unknown> => {
    const query = loadSQL("usuarios/create-or-update.sql");
    const result: QueryResult = await pool.query(query, [
      data.cedula,
      data.nombres,
      data.apellidos,
      data.correo_electronico,
      data.nombre_usuario,
      data.contrasena,
      data.telefono_celular || null,
    ]);
    return result.rows[0];
  },

  /**
   * Crea un nuevo usuario completo
   */
  createUser: async (data: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    contrasena: string;
    telefono_celular?: string | null;
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
    cedula_actor?: string;
  }): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar que el usuario no exista
      const existingUser = await client.query(
        'SELECT 1 FROM usuarios WHERE cedula = $1',
        [data.cedula]
      );
      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new Error(`El usuario con cédula ${data.cedula} ya existe`);
      }

      // Verificar que el correo no esté en uso
      const existingEmail = await client.query(
        'SELECT 1 FROM usuarios WHERE correo_electronico = $1',
        [data.correo_electronico]
      );
      if (existingEmail.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new Error(`El correo electrónico ${data.correo_electronico} ya está en uso`);
      }

      // Verificar que el nombre_usuario no esté en uso
      const existingUsername = await client.query(
        'SELECT 1 FROM usuarios WHERE nombre_usuario = $1',
        [data.nombre_usuario]
      );
      if (existingUsername.rows.length > 0) {
        await client.query('ROLLBACK');
        throw new Error(`El nombre de usuario ${data.nombre_usuario} ya está en uso`);
      }

      // Establecer variable de sesión para el trigger de auditoría
      if (data.cedula_actor) {
        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [data.cedula_actor]);
      }

      // Insertar en tabla usuarios (el trigger capturará la auditoría automáticamente)
      const insertQuery = loadSQL('usuarios/create.sql');
      await client.query(insertQuery, [
        data.cedula,
        data.nombres,
        data.apellidos,
        data.correo_electronico,
        data.nombre_usuario,
        data.contrasena,
        data.telefono_celular || null,
        data.tipo_usuario,
      ]);

      // Insertar en la tabla correspondiente según el tipo
      if (data.tipo_usuario === 'Estudiante') {
        if (!data.estudiante?.term || !data.estudiante?.tipo_estudiante || !data.estudiante?.nrc) {
          await client.query('ROLLBACK');
          throw new Error('Para crear un estudiante se requiere term, tipo_estudiante y nrc');
        }
        // Usar el client de la transacción en lugar de pool.query
        const insertEstudianteQuery = loadSQL('estudiantes/create-or-update.sql');
        await client.query(insertEstudianteQuery, [
          data.estudiante.term,
          data.cedula,
          data.estudiante.tipo_estudiante,
          data.estudiante.nrc,
        ]);
      } else if (data.tipo_usuario === 'Profesor') {
        if (!data.profesor?.term || !data.profesor?.tipo_profesor) {
          await client.query('ROLLBACK');
          throw new Error('Para crear un profesor se requiere term y tipo_profesor');
        }
        // Usar el client de la transacción en lugar de pool.query
        const insertProfesorQuery = loadSQL('profesores/create.sql');
        await client.query(insertProfesorQuery, [
          data.cedula,
          data.profesor.term,
          data.profesor.tipo_profesor,
        ]);
      } else if (data.tipo_usuario === 'Coordinador') {
        if (!data.coordinador?.term) {
          await client.query('ROLLBACK');
          throw new Error('Para crear un coordinador se requiere term');
        }
        const insertCoordinadorQuery = loadSQL('coordinadores/create.sql');
        await client.query(insertCoordinadorQuery, [
          data.cedula,
          data.coordinador.term,
        ]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getAll: async (habilitadosOnly: boolean = false): Promise<
    Array<{
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
    }>
  > => {
    let query = loadSQL("usuarios/get-all.sql");
    if (habilitadosOnly) {
      // Buscamos el último ORDER BY de la consulta principal para insertar el WHERE antes
      const parts = query.split('ORDER BY u.tipo_usuario');
      if (parts.length > 1) {
        query = parts[0] + 'WHERE u.habilitado_sistema = true ORDER BY u.tipo_usuario' + parts[1];
      }
    }
    const result: QueryResult = await pool.query(query);
    return result.rows;
  },

  /**
   * Actualiza la contraseña de un usuario por correo electrónico
   */
  updatePasswordByEmail: async (
    email: string,
    passwordHash: string
  ): Promise<unknown> => {
    const query = loadSQL("usuarios/update-password.sql");
    const result: QueryResult = await pool.query(query, [email, passwordHash]);
    return result.rows[0];
  },

  /**
   * Elimina un usuario y guarda su cédula
   */
  toggleHabilitado: async (
    cedula: string,
    cedula_actor: string
  ): Promise<{
    success: boolean;
    error?: { message: string; code?: string };
  }> => {
    try {
      await pool.query("SELECT toggle_habilitado_usuario($1, $2)", [cedula, cedula_actor]);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          message: (error as Error).message,
          code: (error as Error & { code?: string }).code,
        },
      };
    }
  },

  /**
   * Elimina físicamente un usuario y todas sus referencias, registrando auditoría en el procedimiento
   */
  deleteFisico: async (
    cedula_usuario: string,
    cedula_actor: string,
    motivo: string
  ): Promise<void> => {
    // Llama a la función que ya realiza la auditoría internamente
    await pool.query("SELECT eliminar_usuario_fisico($1, $2, $3)", [
      cedula_usuario,
      cedula_actor,
      motivo,
    ]);
  },

  /**
   * Información de un Solo usuario por cédula
   */
  getInfoByCedula: async (
    cedula: string
  ): Promise<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular: string | null;
    habilitado_sistema: boolean;
    tipo_usuario: string;
    fotoPerfil?: string | null;
    estudiantes?: Array<{
      term: string;
      nrc: string | null;
      tipo_estudiante: "Voluntario" | "Inscrito" | "Egresado" | "Servicio Comunitario" | null;
      habilitado: boolean;
    }>;
    profesores?: Array<{
      term: string;
      tipo_profesor: string | null;
      habilitado: boolean;
    }>;
    coordinadores?: Array<{
      term: string;
      habilitado: boolean;
    }>;
    // Mantener compatibilidad con el formato anterior (primer registro)
    estudiante?: {
      nrc: string | null;
      term: string | null;
      tipo_estudiante: "Voluntario" | "Inscrito" | "Egresado" | "Servicio Comunitario" | null;
    };
    profesor?: {
      term: string | null;
      tipo_profesor: string | null;
    };
    coordinador?: {
      term: string | null;
    };
  } | null> => {
    const query = loadSQL("usuarios/get-all-by-cedula.sql");
    const result: QueryResult = await pool.query(query, [cedula]);
    const row = result.rows[0];
    if (!row) return null;

    // Obtener foto de perfil
    const fotoBuffer = await usuariosQueries.getFotoPerfil(cedula);
    let fotoPerfilBase64: string | null = null;

    if (fotoBuffer) {
      fotoPerfilBase64 = `data:image/jpeg;base64,${fotoBuffer.toString('base64')}`;
    }

    // Parsear arrays de JSON
    const estudiantes = row.estudiantes || null;
    const profesores = row.profesores || null;
    const coordinadores = row.coordinadores || null;

    // Obtener el primer registro de cada tipo para mantener compatibilidad
    const primerEstudiante = estudiantes?.[0] || null;
    const primerProfesor = profesores?.[0] || null;
    const primerCoordinador = coordinadores?.[0] || null;

    return {
      cedula: row.cedula,
      nombres: row.nombres,
      apellidos: row.apellidos,
      nombre_completo: row.nombre_completo,
      correo_electronico: row.correo_electronico,
      nombre_usuario: row.nombre_usuario,
      telefono_celular: row.telefono_celular,
      habilitado_sistema: row.habilitado_sistema,
      tipo_usuario: row.tipo_usuario,
      fotoPerfil: fotoPerfilBase64,
      // Nuevos campos con todos los semestres
      estudiantes: estudiantes,
      profesores: profesores,
      coordinadores: coordinadores,
      // Mantener compatibilidad con el formato anterior
      estudiante: primerEstudiante
        ? {
          nrc: primerEstudiante.nrc,
          term: primerEstudiante.term,
          tipo_estudiante: primerEstudiante.tipo_estudiante,
        }
        : undefined,
      profesor: primerProfesor
        ? {
          term: primerProfesor.term,
          tipo_profesor: primerProfesor.tipo_profesor,
        }
        : undefined,
      coordinador: primerCoordinador
        ? {
          term: primerCoordinador.term,
        }
        : undefined,
    };
  },

  /**
   * Actualiza toda la información de un usuario
   */
  updateUsuarioByCedulaAction: async (data: {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_usuario: string;
    telefono_celular?: string | null;
    tipo_usuario: string;
    nrc?: string | null;
    term?: string | null;
    tipo_estudiante?:
    | "Voluntario"
    | "Inscrito"
    | "Egresado"
    | "Servicio Comunitario"
    | null;
    tipo_profesor?: string | null;
    cedula_actor?: string;
  }): Promise<void> => {
    // Se espera que la cédula del usuario autenticado llegue como data.cedula_actor
    if (!data.cedula_actor) {
      throw new Error('No se recibió la cédula del usuario autenticado');
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener el tipo_usuario actual del usuario para determinar qué valores pasar
      const tipoUsuarioResult = await client.query(
        'SELECT tipo_usuario FROM usuarios WHERE cedula = $1',
        [data.cedula]
      );
      const tipoUsuarioActual = tipoUsuarioResult.rows[0]?.tipo_usuario || null;

      // Usar el tipo_usuario que se está pasando, o el actual si no se pasa
      const tipoUsuarioParaValores = (data.tipo_usuario && data.tipo_usuario.trim() !== '')
        ? data.tipo_usuario
        : tipoUsuarioActual;

      await client.query(
        `CALL update_all_by_cedula(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )`,
        [
          data.cedula,
          data.nombres ?? null,
          data.apellidos ?? null,
          data.correo_electronico ?? null,
          data.nombre_usuario ?? null,
          data.telefono_celular ?? null,
          data.tipo_usuario && data.tipo_usuario.trim() !== '' ? data.tipo_usuario : null,
          // Estudiante - usar tipoUsuarioParaValores para determinar si pasar valores
          tipoUsuarioParaValores === "Estudiante" ? data.nrc ?? null : null,
          tipoUsuarioParaValores === "Estudiante" ? data.term ?? null : null,
          tipoUsuarioParaValores === "Estudiante" ? data.tipo_estudiante ?? null : null,
          // Profesor
          tipoUsuarioParaValores === "Profesor" ? data.term ?? null : null,
          tipoUsuarioParaValores === "Profesor" ? data.tipo_profesor ?? null : null,
          // Coordinador
          tipoUsuarioParaValores === "Coordinador" ? data.term ?? null : null,
          //Cedula actor (Usuario que realiza la acción)
          data.cedula_actor
        ]
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Obtiene la foto de perfil de un usuario
   */
  getFotoPerfil: async (cedula: string): Promise<Buffer | null> => {
    const query = loadSQL('usuarios/get-foto-perfil.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows[0]?.foto_perfil || null;
  },

  /**
   * Actualiza la foto de perfil de un usuario
   */
  updateFotoPerfil: async (cedula: string, fotoPerfil: Buffer): Promise<void> => {
    const query = loadSQL('usuarios/update-foto-perfil.sql');
    await pool.query(query, [cedula, fotoPerfil]);
  },

  /**
   * Elimina la foto de perfil de un usuario (establece a NULL)
   */
  deleteFotoPerfil: async (cedula: string): Promise<void> => {
    const query = loadSQL('usuarios/delete-foto-perfil.sql');
    await pool.query(query, [cedula]);
  },

  /**
   * Deshabilita múltiples usuarios de forma masiva y registra en auditoría
   */
  disableLote: async (cedulas: string[], cedula_actor: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Registrar en auditoría de eliminación (ahora deshabilitación) antes de actualizar
      const auditQuery = `
        INSERT INTO auditoria_eliminacion_usuario (
          usuario_eliminado, 
          nombres_usuario_eliminado, 
          apellidos_usuario_eliminado, 
          eliminado_por, 
          motivo, 
          fecha
        )
        SELECT 
          cedula, 
          nombres, 
          apellidos, 
          $1, 
          'Deshabilitación masiva por lote', 
          (NOW() AT TIME ZONE 'America/Caracas')
        FROM usuarios
        WHERE cedula = ANY($2)
      `;
      await client.query(auditQuery, [cedula_actor, cedulas]);

      // 2. Actualizar el estado en la tabla de usuarios
      const updateQuery = 'UPDATE usuarios SET habilitado_sistema = false WHERE cedula = ANY($1)';
      await client.query(updateQuery, [cedulas]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Habilita múltiples usuarios de forma masiva y registra en auditoría
   */
  enableLote: async (cedulas: string[], cedula_actor: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Registrar en auditoría de habilitación
      const auditQuery = `
        INSERT INTO auditoria_habilitacion_usuario (
          usuario_habilitado, 
          nombres_usuario_habilitado, 
          apellidos_usuario_habilitado, 
          habilitado_por, 
          motivo, 
          fecha
        )
        SELECT 
          cedula, 
          nombres, 
          apellidos, 
          $1, 
          'Reactivación masiva por lote', 
          (NOW() AT TIME ZONE 'America/Caracas')
        FROM usuarios
        WHERE cedula = ANY($2)
      `;
      await client.query(auditQuery, [cedula_actor, cedulas]);

      // 2. Actualizar el estado en la tabla de usuarios
      const updateQuery = 'UPDATE usuarios SET habilitado_sistema = true WHERE cedula = ANY($1)';
      await client.query(updateQuery, [cedulas]);
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};






