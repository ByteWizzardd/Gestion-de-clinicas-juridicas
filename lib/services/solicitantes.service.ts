import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';
import { solicitantesQueries, type Solicitante } from '@/lib/db/queries/solicitantes.queries';
import { AppError } from '@/lib/utils/errors';

interface ApplicantFormData {
  // Identificación
  cedulaTipo: string;
  cedulaNumero: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: string;
  telefonoLocal: string;
  codigoPaisCelular: string;
  telefonoCelular: string;
  correoElectronico: string;
  estadoCivil: string;
  concubinato: string;
  nacionalidad: string;
  // Vivienda
  tipoVivienda: string;
  cantHabitaciones: string;
  cantBanos: string;
  materialPiso: string;
  materialParedes: string;
  materialTecho: string;
  aguaPotable: string;
  eliminacionAguasN: string;
  aseo: string;
  // Familia y Hogar
  cantPersonas: string;
  cantTrabajadores: string;
  cantNinos: string;
  cantNinosEstudiando: string;
  jefeHogar: string;
  tipoEducativo: string;
  numeroEducativo: string;
  nivelEducativo: string;
  anosCursados: string;
  semestresCursados: string;
  trimestresCursados: string;
  ingresosMensuales: string;
  // Nivel Educativo del Solicitante
  tipoEducativoSolicitante: string;
  numeroEducativoSolicitante: string;
  nivelEducativoSolicitante: string;
  anosCursadosSolicitante: string;
  semestresCursadosSolicitante: string;
  trimestresCursadosSolicitante: string;
  // Trabajo
  trabaja: string;
  condicionTrabajo: string;
  buscandoTrabajo: string;
  condicionActividad: string;
}

export class SolicitantesService {
  /**
   * Obtiene todos los solicitantes del sistema
   * @returns Promise<Solicitante[]> - Lista de solicitantes
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getAllSolicitantes(): Promise<Solicitante[]> {
    try {
      return await solicitantesQueries.getAllSolicitantes();
    } catch (error) {
      console.error("[SolicitantesService] Error fetching solicitantes:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        "No se pudieron obtener los solicitantes. Por favor, intente más tarde.",
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Obtiene un solicitante por su cédula con toda su información relacionada
   * @param cedula - Cédula del solicitante
   * @returns Promise<any | null> - Información completa del solicitante o null si no existe
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getSolicitanteById(cedula: string): Promise<any | null> {
    try {
      return await solicitantesQueries.getSolicitanteById(cedula);
    } catch (error) {
      console.error("[SolicitantesService] Error fetching solicitante by id:", error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        "No se pudo obtener el solicitante. Por favor, intente más tarde.",
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Obtiene un solicitante completo por su cédula con todas sus relaciones
   * (núcleo, educación, trabajo, hogar, vivienda, casos)
   * @param cedula - Cédula del solicitante
   * @returns Promise<any | null> - Información completa del solicitante o null si no existe
   * @throws {AppError} - Si ocurre un error al obtener los datos
   */
  static async getSolicitanteCompleto(cedula: string): Promise<any | null> {
    try {
      return await solicitantesQueries.getSolicitanteCompleto(cedula);
    } catch (error) {
      console.error('[SolicitantesService] Error fetching solicitante completo:', error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`);
      }
      throw new AppError(
        'No se pudo obtener la información completa del solicitante. Por favor, intente más tarde.',
        500,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export const solicitantesService = {
  /**
   * Crea/registra un nuevo solicitante con todos sus datos completos
   * Nota: Un solicitante es diferente de un usuario. Los usuarios son estudiantes/profesores/coordinadores
   * que trabajan en la clínica, mientras que los solicitantes son las personas que solicitan servicios legales.
   */
  create: async (data: ApplicantFormData): Promise<any> => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Crear o verificar solicitante básico
      // Construir cédula con formato V-XXXX (con guión)
      const cedula = `${data.cedulaTipo}-${data.cedulaNumero}`;
      const sexo = data.sexo === 'Masculino' ? 'M' : 'F';
      
      // Asignar nacionalidad según el tipo de cédula
      let nacionalidad = 'V'; // Por defecto venezolano
      if (data.cedulaTipo === 'V' || data.cedulaTipo === 'J') {
        nacionalidad = 'V'; // Venezolano
      } else if (data.cedulaTipo === 'E') {
        nacionalidad = 'Ext'; // Extranjero
      } else if (data.cedulaTipo === 'P') {
        // Si es pasaporte, usar la nacionalidad del formulario
        nacionalidad = data.nacionalidad || 'Ext'; // Por defecto extranjero si no se especifica
      }
      
      // Verificar si el solicitante ya existe
      const checkSolicitanteQuery = loadSQL('solicitantes/check-exists.sql');
      const solicitanteExistente = await client.query(checkSolicitanteQuery, [cedula]);
      
      if (solicitanteExistente.rows.length === 0) {
        // Crear solicitante básico
        const createSolicitanteQuery = loadSQL('solicitantes/create.sql');
        await client.query(createSolicitanteQuery, [
          cedula,
          data.nombres,
          data.apellidos,
          data.correoElectronico,
          `${data.codigoPaisCelular}${data.telefonoCelular}`,
          data.fechaNacimiento,
          sexo,
          nacionalidad,
        ]);
      }

      // 2. Crear vivienda
      const createViviendaQuery = loadSQL('viviendas/create.sql');
      const viviendaResult: QueryResult = await client.query(createViviendaQuery, [
        cedula,
        parseInt(data.cantHabitaciones),
        parseInt(data.cantBanos),
      ]);
      const vivienda = viviendaResult.rows[0];

      // 3. Crear nivel educativo del solicitante
      const createNivelEducativoQuery = loadSQL('niveles-educativos/create.sql');
      const nivelEducativoSolicitanteResult: QueryResult = await client.query(createNivelEducativoQuery, [
        parseInt(data.numeroEducativoSolicitante),
        parseInt(data.anosCursadosSolicitante || '0'),
        parseInt(data.semestresCursadosSolicitante || '0'),
        parseInt(data.trimestresCursadosSolicitante || '0'),
      ]);
      const nivelEducativoSolicitante = nivelEducativoSolicitanteResult.rows[0];

      // 4. Crear nivel educativo del jefe de hogar (si aplica)
      let nivelEducativoJefeHogar = null;
      if (data.jefeHogar === 'no' && data.numeroEducativo) {
        const nivelEducativoJefeHogarResult: QueryResult = await client.query(createNivelEducativoQuery, [
          parseInt(data.numeroEducativo),
          parseInt(data.anosCursados || '0'),
          parseInt(data.semestresCursados || '0'),
          parseInt(data.trimestresCursados || '0'),
        ]);
        nivelEducativoJefeHogar = nivelEducativoJefeHogarResult.rows[0];
      }

      // 5. Obtener IDs de condicion_trabajo y condicion_actividad
      // En el nuevo schema, solicitantes tiene id_trabajo e id_actividad directamente
      // Necesitamos obtener los IDs de las tablas de catálogo
      const trabaja = data.trabaja === 'si';
      let idTrabajo: number | null = null;
      let idActividad: number | null = null;
      
      if (trabaja && data.condicionTrabajo) {
        // Buscar o usar ID de condicion_trabajo
        // Por ahora usamos un ID por defecto, deberías buscar en la tabla condicion_trabajo
        const trabajoResult = await client.query(
          'SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = $1 LIMIT 1',
          [data.condicionTrabajo]
        );
        idTrabajo = trabajoResult.rows[0]?.id_trabajo || 1; // Fallback a 1 si no existe
      } else if (!trabaja && data.condicionActividad) {
        // Buscar o usar ID de condicion_actividad
        const actividadResult = await client.query(
          'SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = $1 LIMIT 1',
          [data.condicionActividad]
        );
        idActividad = actividadResult.rows[0]?.id_actividad || 1; // Fallback a 1 si no existe
      }
      
      // Si no se encontró ninguno, usar valores por defecto
      if (!idTrabajo) idTrabajo = 1; // Valor por defecto requerido por el schema
      if (!idActividad) idActividad = 1; // Valor por defecto requerido por el schema

      // 6. Crear familia y hogar
      const createHogarQuery = loadSQL('familias-hogares/create.sql');
      const cantTrabajadores = parseInt(data.cantTrabajadores);
      const cantPersonas = parseInt(data.cantPersonas);
      const cantNoTrabajadores = cantPersonas - cantTrabajadores;
      const hogarResult: QueryResult = await client.query(createHogarQuery, [
        cedula,
        cantPersonas,
        cantTrabajadores,
        cantNoTrabajadores,
        parseInt(data.cantNinos),
        parseInt(data.cantNinosEstudiando),
        data.jefeHogar === 'si',
        parseFloat(data.ingresosMensuales),
        nivelEducativoJefeHogar ? (data.anosCursados || data.semestresCursados || data.trimestresCursados ? `${data.anosCursados || 0} años, ${data.semestresCursados || 0} semestres, ${data.trimestresCursados || 0} trimestres` : null) : null,
        nivelEducativoJefeHogar?.id_nivel_educativo || null,
      ]);
      const hogar = hogarResult.rows[0];

      // 7. Nota: Los artefactos domésticos ya no existen en el nuevo schema

      // 8. Actualizar solicitante con todos los datos
      const estadoCivil = data.estadoCivil || null;
      const concubinato = data.concubinato === 'si' ? true : (data.concubinato === 'no' ? false : null);
      
      // Calcular tiempo_estudio del solicitante
      const tiempoEstudioSolicitante = [
        data.anosCursadosSolicitante ? `${data.anosCursadosSolicitante} años` : '',
        data.semestresCursadosSolicitante ? `${data.semestresCursadosSolicitante} semestres` : '',
        data.trimestresCursadosSolicitante ? `${data.trimestresCursadosSolicitante} trimestres` : '',
      ].filter(Boolean).join(', ') || '';
      
      const updateSolicitanteQuery = loadSQL('solicitantes/update-complete.sql');
      const solicitanteResult: QueryResult = await client.query(updateSolicitanteQuery, [
        cedula,
        data.telefonoLocal || null,
        `${data.codigoPaisCelular}${data.telefonoCelular}`,
        estadoCivil,
        concubinato,
        tiempoEstudioSolicitante || '',
        nivelEducativoSolicitante.id_nivel_educativo,
        idTrabajo,
        idActividad,
        // TODO: Agregar id_estado, num_municipio, num_parroquia cuando estén disponibles en el formulario
        1, // id_estado temporal
        1, // num_municipio temporal
        1, // num_parroquia temporal
      ]);
      const solicitanteActualizado = solicitanteResult.rows[0];

      await client.query('COMMIT');
      
      return {
        solicitante: solicitanteActualizado,
        vivienda,
        nivelEducativo: nivelEducativoSolicitante,
        idTrabajo,
        idActividad,
        hogar,
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      logger.error('Error al registrar solicitante', error);
      
      // Mejorar el mensaje de error para debugging
      const errorMessage = error?.message || 'Error desconocido';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      const errorDetail = error?.detail || '';
      
      const enhancedError = new Error(
        `Error al registrar solicitante: ${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}`
      );
      (enhancedError as any).code = errorCode;
      (enhancedError as any).detail = errorDetail;
      
      throw enhancedError;
    } finally {
      client.release();
    }
  },
};

