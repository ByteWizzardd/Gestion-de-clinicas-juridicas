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
  tipoTiempoEstudioJefe: string;
  tiempoEstudioJefe: string;
  ingresosMensuales: string;
  // Nivel Educativo del Solicitante
  tipoEducativoSolicitante: string;
  numeroEducativoSolicitante: string;
  nivelEducativoSolicitante: string;
  tipoTiempoEstudioSolicitante: string;
  tiempoEstudioSolicitante: string;
  // Ubicación
  idEstado: string;
  numMunicipio: string;
  numParroquia: string;
  // Trabajo
  trabaja: string;
  condicionTrabajo: string;
  buscandoTrabajo: string;
  condicionActividad: string;
  artefactosDomesticos?: string[]; // Array de artefactos seleccionados
}

/**
 * Genera la descripción del nivel educativo basándose en el número educativo
 * @param numeroEducativo - Número educativo del 0 al 14
 * @returns Descripción del nivel educativo (solo los 7 niveles básicos)
 */
function getNivelEducativoDescripcion(numeroEducativo: string): string {
  const num = parseInt(numeroEducativo);
  
  if (num === 0) return 'Sin Nivel';
  if (num >= 1 && num <= 6) return 'Primaria';
  if (num >= 7 && num <= 9) return 'Básica';
  if (num === 10 || num === 11) return 'Media Diversificada';
  if (num === 12) return 'Técnico Medio';
  if (num === 13) return 'Técnico Superior';
  if (num === 14) return 'Universitaria';
  
  return 'Sin Nivel'; // Fallback
}


function buildTelefonoCelular(input: {
  telefonoCelular?: unknown;
  codigoPaisCelular?: unknown;
}): string {
  const rawTelefono = (input.telefonoCelular ?? "").toString().trim();

  // Si ya viene en formato internacional, usarlo tal cual (sin espacios)
  if (rawTelefono.startsWith("+")) {
    const normalized = rawTelefono.replace(/\s+/g, "");
    return normalized;
  }

  // Si viene solo el número, concatenar con código país (o default +58)
  const rawCode = (input.codigoPaisCelular ?? "+58").toString().trim();
  const normalizedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
  const onlyDigits = rawTelefono.replace(/\D/g, "");
  return `${normalizedCode}${onlyDigits}`;
}

/**
 * Busca o crea un nivel educativo por su descripción
 * @param client - Cliente de base de datos
 * @param descripcion - Descripción del nivel educativo
 * @returns Nivel educativo encontrado o creado
 */
async function findOrCreateNivelEducativo(client: any, descripcion: string): Promise<any> {
  // Primero intentar buscar
  const findResult: QueryResult = await client.query(
    'SELECT * FROM niveles_educativos WHERE descripcion = $1 LIMIT 1',
    [descripcion]
  );
  
  if (findResult.rows.length > 0) {
    return findResult.rows[0];
  }
  
  // Si no existe, crearlo
  const createNivelEducativoQuery = loadSQL('niveles-educativos/create.sql');
  const createResult: QueryResult = await client.query(createNivelEducativoQuery, [descripcion]);
  return createResult.rows[0];
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
      const telefonoCelularCompleto = buildTelefonoCelular({
        telefonoCelular: data.telefonoCelular,
        codigoPaisCelular: data.codigoPaisCelular,
      });
      
      // Asignar nacionalidad según el tipo de cédula
      // NOTA: El schema solo permite 'V' (Venezolano) o 'E' (Extranjero)
      let nacionalidad = 'V'; // Por defecto venezolano
      if (data.cedulaTipo === 'V' || data.cedulaTipo === 'J') {
        nacionalidad = 'V'; // Venezolano
      } else if (data.cedulaTipo === 'E') {
        nacionalidad = 'E'; // Extranjero (el schema usa 'E', no 'Ext')
      } else if (data.cedulaTipo === 'P') {
        // Si es pasaporte, usar la nacionalidad del formulario
        // Convertir 'Ext' a 'E' si viene del formulario
        const nacionalidadForm = data.nacionalidad || 'E';
        nacionalidad = nacionalidadForm === 'Ext' ? 'E' : (nacionalidadForm === 'V' ? 'V' : 'E');
      }
      
      // 1. Obtener IDs de condicion_trabajo y condicion_actividad ANTES de crear/actualizar solicitante
      // Lógica:
      // - Si TRABAJA: id_trabajo = valor (1,2,3,4), id_actividad = NULL (no aplica, ya está trabajando)
      // - Si NO TRABAJA: id_trabajo = 0, id_actividad puede ser 0 (buscando trabajo) u otro valor (1,2,3,4) o NULL
      let idTrabajo: number | null = null;
      let idActividad: number | null = null;
      
      if (data.trabaja === 'si' && data.condicionTrabajo) {
        // Si trabaja: buscar ID de condicion_trabajo
        const trabajoResult = await client.query(
          'SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = $1 LIMIT 1',
          [data.condicionTrabajo]
        );
        idTrabajo = trabajoResult.rows[0]?.id_trabajo || null;
        // Si trabaja, id_actividad debe ser NULL (no tiene sentido que esté buscando trabajo si ya trabaja)
        idActividad = null;
      } else if (data.trabaja === 'no') {
        // Si no trabaja: id_trabajo = 0 (no trabaja)
        idTrabajo = 0;
        
        if (data.buscandoTrabajo === 'si') {
          // Si está buscando trabajo: id_actividad = 0 (buscando trabajo)
          idActividad = 0;
        } else if (data.condicionActividad) {
          // Si no está buscando trabajo y tiene condición de actividad: buscar ID
          const actividadResult = await client.query(
            'SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = $1 LIMIT 1',
            [data.condicionActividad]
          );
          idActividad = actividadResult.rows[0]?.id_actividad || null;
        }
        // Si no trabaja y no tiene condición de actividad, id_actividad puede ser NULL
      }
      // Si no se especifica si trabaja o no, ambos pueden ser NULL

      // 2. Buscar o crear nivel educativo del solicitante
      // Usar directamente la descripción del nivel educativo seleccionado
      const descripcionNivelSolicitante = data.nivelEducativoSolicitante || getNivelEducativoDescripcion(data.numeroEducativoSolicitante || '0');
      const nivelEducativoSolicitante = await findOrCreateNivelEducativo(client, descripcionNivelSolicitante);

      // 3. Verificar si el solicitante ya existe
      const checkSolicitanteQuery = loadSQL('solicitantes/check-exists.sql');
      const solicitanteExistente = await client.query(checkSolicitanteQuery, [cedula]);
      
      if (solicitanteExistente.rows.length === 0) {
        // Verificar si el correo electrónico ya existe en otro solicitante antes de crear
        const checkEmailQuery = loadSQL('solicitantes/check-email-exists.sql');
        const emailExistente = await client.query(checkEmailQuery, [data.correoElectronico]);
        
        if (emailExistente.rows.length > 0) {
          await client.query('ROLLBACK');
          throw new AppError(
            `El correo electrónico ${data.correoElectronico} ya está asociado a otro solicitante`,
            400,
            'EMAIL_DUPLICADO'
          );
        }
        
        // Crear solicitante básico
        const createSolicitanteQuery = loadSQL('solicitantes/create.sql');
        try {
          await client.query(createSolicitanteQuery, [
            cedula,
            data.nombres,
            data.apellidos,
            data.correoElectronico,
            telefonoCelularCompleto,
            data.fechaNacimiento,
            sexo,
            nacionalidad,
            idTrabajo, // Puede ser NULL
            idActividad, // Puede ser NULL
          ]);
        } catch (error: any) {
          // Si es un error de unique constraint en correo_electronico
          if (error.code === '23505' && error.constraint === 'solicitantes_correo_electronico_unique') {
            await client.query('ROLLBACK');
            throw new AppError(
              `El correo electrónico ${data.correoElectronico} ya está asociado a otro solicitante`,
              400,
              'EMAIL_DUPLICADO'
            );
          }
          throw error;
        }
      } else {
        // Si el solicitante ya existe, verificar que el correo no haya cambiado a uno que ya existe
        const solicitanteActual = solicitanteExistente.rows[0];
        if (solicitanteActual.correo_electronico !== data.correoElectronico) {
          // El correo está cambiando, verificar que el nuevo no exista en otro solicitante
          const checkNuevoEmailQuery = loadSQL('solicitantes/check-email-exists.sql');
          const nuevoEmailExistente = await client.query(checkNuevoEmailQuery, [data.correoElectronico]);
          
          // Si el correo existe y no es del mismo solicitante, error
          if (nuevoEmailExistente.rows.length > 0) {
            const otroSolicitante = nuevoEmailExistente.rows[0];
            if (otroSolicitante.cedula !== cedula) {
              await client.query('ROLLBACK');
              throw new AppError(
                `El correo electrónico ${data.correoElectronico} ya está asociado a otro solicitante`,
                400,
                'EMAIL_DUPLICADO'
              );
            }
          }
        }
        
        // Actualizar id_trabajo e id_actividad si el solicitante ya existe
        await client.query(
          'UPDATE solicitantes SET id_trabajo = $1, id_actividad = $2 WHERE cedula = $3',
          [idTrabajo, idActividad, cedula]
        );
      }

      // 4. Crear vivienda
      const createViviendaQuery = loadSQL('viviendas/create.sql');
      const viviendaResult: QueryResult = await client.query(createViviendaQuery, [
        cedula,
        parseInt(data.cantHabitaciones),
        parseInt(data.cantBanos),
      ]);
      const vivienda = viviendaResult.rows[0];

      // 5. Buscar o crear nivel educativo del jefe de hogar (si aplica)
      let nivelEducativoJefeHogar = null;
      if (data.jefeHogar === 'no' && (data.nivelEducativo || data.numeroEducativo)) {
        // Usar directamente la descripción del nivel educativo seleccionado, o calcularla desde número si existe
        const descripcionNivelJefe = data.nivelEducativo || getNivelEducativoDescripcion(data.numeroEducativo || '0');
        nivelEducativoJefeHogar = await findOrCreateNivelEducativo(client, descripcionNivelJefe);
      }

      // 6. Actualizar nivel educativo del solicitante
      await client.query(
        'UPDATE solicitantes SET id_nivel_educativo = $1 WHERE cedula = $2',
        [nivelEducativoSolicitante.id_nivel_educativo, cedula]
      );

      // 7. Crear familia y hogar
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
        nivelEducativoJefeHogar ? (data.tipoTiempoEstudioJefe || null) : null,
        nivelEducativoJefeHogar ? (data.tiempoEstudioJefe ? parseInt(data.tiempoEstudioJefe) : null) : null,
        nivelEducativoJefeHogar?.id_nivel_educativo || null,
      ]);
      const hogar = hogarResult.rows[0];

      // 8. Guardar características de vivienda en asignadas_a
      // Mapear descripciones a num_caracteristica según el catálogo
      const guardarCaracteristica = async (
        descripcion: string,
        idTipo: number
      ) => {
        if (!descripcion) return;
        
        const result = await client.query(
          'SELECT num_caracteristica FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND descripcion = $2 LIMIT 1',
          [idTipo, descripcion]
        );
        
        if (result.rows.length > 0) {
          await client.query(
            'INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [cedula, idTipo, result.rows[0].num_caracteristica]
          );
        }
      };

      // Guardar todas las características de vivienda
      await guardarCaracteristica(data.tipoVivienda, 1); // tipo_vivienda
      await guardarCaracteristica(data.materialPiso, 2); // material_piso
      await guardarCaracteristica(data.materialParedes, 3); // material_paredes
      await guardarCaracteristica(data.materialTecho, 4); // material_techo
      await guardarCaracteristica(data.aguaPotable, 5); // agua_potable
      await guardarCaracteristica(data.aseo, 6); // aseo
      await guardarCaracteristica(data.eliminacionAguasN, 7); // eliminacion_aguas_n

      // 8. Guardar artefactos domésticos como características (tipo 8) en asignadas_a
      if (data.artefactosDomesticos && data.artefactosDomesticos.length > 0) {
        // Usar la función guardarCaracteristica para buscar dinámicamente por descripción
        for (const artefactoNombre of data.artefactosDomesticos) {
          await guardarCaracteristica(artefactoNombre, 8); // tipo 8 = artefactos_domesticos
        }
      }

      // 8. Actualizar solicitante con todos los datos
      const estadoCivil = data.estadoCivil || null;
      const concubinato = data.concubinato === 'si' ? true : (data.concubinato === 'no' ? false : null);
      
      // Obtener tipo y tiempo de estudio del solicitante
      const tipoTiempoEstudioSolicitante = data.tipoTiempoEstudioSolicitante || null;
      const tiempoEstudioSolicitante = data.tiempoEstudioSolicitante ? parseInt(data.tiempoEstudioSolicitante) : null;
      
      const updateSolicitanteQuery = loadSQL('solicitantes/update-complete.sql');
      const solicitanteResult: QueryResult = await client.query(updateSolicitanteQuery, [
        cedula,
        data.telefonoLocal || null,
        telefonoCelularCompleto,
        estadoCivil,
        concubinato,
        tipoTiempoEstudioSolicitante,
        tiempoEstudioSolicitante,
        nivelEducativoSolicitante.id_nivel_educativo,
        idTrabajo,
        idActividad,
        data.idEstado ? parseInt(data.idEstado) : 1, // id_estado
        data.numMunicipio ? parseInt(data.numMunicipio) : 1, // num_municipio
        data.numParroquia ? parseInt(data.numParroquia) : 1, // num_parroquia
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

