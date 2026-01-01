import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Usuarios
 * Todas las queries SQL están en database/queries/usuarios/
 */
export const usuariosQueries = {
  /**
   * Busca usuarios por cédula (búsqueda parcial)
   * Busca en la tabla usuarios (estudiantes, profesores, coordinadores)
   */
  searchByCedula: async (
    cedula: string
  ): Promise<
    Array<{
      cedula: string;
      nombres: string;
      apellidos: string;
      nombre_completo: string;
    }>
  > => {
    const query = loadSQL("usuarios/search-by-cedula.sql");
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
   * Obtiene todos los usuarios con información adicional
   */
  getAll: async (): Promise<
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
    const query = loadSQL("usuarios/get-all.sql");
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
    cedula: string
  ): Promise<{
    success: boolean;
    error?: { message: string; code?: string };
  }> => {
    try {
      await pool.query("SELECT toggle_habilitado_usuario($1)", [cedula]);
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
      estudiante:
        row.estudiante_nrc || row.estudiante_term || row.estudiante_tipo
          ? {
              nrc: row.estudiante_nrc,
              term: row.estudiante_term,
              tipo_estudiante: row.estudiante_tipo,
            }
          : undefined,
      profesor:
        row.profesor_term || row.profesor_tipo
          ? {
              term: row.profesor_term,
              tipo_profesor: row.profesor_tipo,
            }
          : undefined,
      coordinador: row.coordinador_term
        ? {
            term: row.coordinador_term,
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
            data.tipo_usuario ?? null,
            // Estudiante
            data.tipo_usuario === "Estudiante" ? data.nrc ?? null : null,
            data.tipo_usuario === "Estudiante" ? data.term ?? null : null,
            data.tipo_usuario === "Estudiante" ? data.tipo_estudiante ?? null : null,
            // Profesor
            data.tipo_usuario === "Profesor" ? data.term ?? null : null,
            data.tipo_usuario === "Profesor" ? data.tipo_profesor ?? null : null,
            // Coordinador
            data.tipo_usuario === "Coordinador" ? data.term ?? null : null,
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
};






