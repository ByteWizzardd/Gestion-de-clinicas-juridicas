import { loadSQL } from '../sql-loader';
import { pool } from '../pool';
import { QueryResult } from 'pg';

/**
 * Queries para la entidad Clientes
 * Todas las queries SQL están en database/queries/clientes/
 */
export const clientesQueries = {
  /**
   * Busca clientes por cédula (búsqueda parcial)
   */
  searchByCedula: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('clientes/search-by-cedula.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca clientes por cédula excluyendo solicitantes (para recomendaciones)
   */
  searchByCedulaExcludeSolicitantes: async (cedula: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: Date;
    telefono_celular: string;
    correo_electronico: string;
    sexo: string;
    nacionalidad: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('clientes/search-by-cedula-exclude-solicitantes.sql');
    const result: QueryResult = await pool.query(query, [cedula]);
    return result.rows;
  },

  /**
   * Busca clientes por correo electrónico (búsqueda exacta)
   */
  searchByEmail: async (email: string): Promise<Array<{
    cedula: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
    nombre_completo: string;
  }>> => {
    const query = loadSQL('clientes/search-by-email.sql');
    const result: QueryResult = await pool.query(query, [email]);
    return result.rows;
  },

  /**
   * Actualiza un cliente con todos los datos completos
   */
  updateComplete: async (data: {
    cedula: string;
    telefonoLocal?: string | null;
    telefonoCelular: string;
    estadoCivil?: string | null;
    concubinato?: boolean | null;
    idHogar?: number | null;
    idNivelEducativo?: number | null;
    idTrabajo?: number | null;
    idVivienda?: number | null;
  }): Promise<any> => {
    const query = loadSQL('clientes/update-complete.sql');
    const result: QueryResult = await pool.query(query, [
      data.cedula,
      data.telefonoLocal || null,
      data.telefonoCelular,
      data.estadoCivil || null,
      data.concubinato ?? null,
      data.idHogar || null,
      data.idNivelEducativo || null,
      data.idTrabajo || null,
      data.idVivienda || null,
    ]);
    return result.rows[0];
  },

  /**
   * Obtiene un cliente completo por su cédula con todas sus relaciones
   * (núcleo, educación, trabajo, hogar, vivienda, casos)
   */
  getClienteCompleto: async (cedula: string): Promise<any | null> => {
    try {
      // Obtener información completa del cliente
      const getCompletoSQL = loadSQL('clientes/get-by-cedula-completo.sql');
      const resultCompleto: QueryResult = await pool.query(getCompletoSQL, [cedula]);
      
      if (resultCompleto.rows.length === 0) {
        return null;
      }
      
      const cliente = resultCompleto.rows[0];
      
      // Formatear fechas
      if (cliente.fecha_nacimiento) {
        cliente.fecha_nacimiento = cliente.fecha_nacimiento.toISOString().slice(0, 10);
      }
      
      // Obtener artefactos domésticos (solo si tiene hogar)
      if (cliente.id_hogar) {
        try {
          const getArtefactosSQL = loadSQL('clientes/get-artefactos-by-cedula.sql');
          const resultArtefactos: QueryResult = await pool.query(getArtefactosSQL, [cedula]);
          cliente.artefactos = resultArtefactos.rows.map((row: { artefacto: string }) => row.artefacto);
        } catch (error) {
          console.error('Error obteniendo artefactos:', error);
          cliente.artefactos = [];
        }
      } else {
        cliente.artefactos = [];
      }
      
      // Obtener casos asociados
      try {
        const getCasosSQL = loadSQL('clientes/get-casos-by-cedula.sql');
        const resultCasos: QueryResult = await pool.query(getCasosSQL, [cedula]);
        cliente.casos = resultCasos.rows.map((caso: any) => {
          // Formatear fechas de casos
          if (caso.fecha_solicitud) {
            caso.fecha_solicitud = caso.fecha_solicitud.toISOString().slice(0, 10);
          }
          if (caso.fecha_inicio_caso) {
            caso.fecha_inicio_caso = caso.fecha_inicio_caso.toISOString().slice(0, 10);
          }
          if (caso.fecha_fin_caso) {
            caso.fecha_fin_caso = caso.fecha_fin_caso.toISOString().slice(0, 10);
          }
          return caso;
        });
      } catch (error) {
        console.error('Error obteniendo casos:', error);
        cliente.casos = [];
      }
      
      return cliente;
    } catch (error) {
      console.error('Error en getClienteCompleto:', error);
      throw error;
    }
  },
};

