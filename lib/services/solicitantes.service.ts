import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { QueryResult, type PoolClient } from 'pg';
import { logger } from '@/lib/utils/logger';
import { solicitantesQueries, type Solicitante, type SolicitanteCompleto } from '@/lib/db/queries/solicitantes.queries';
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
  codigoPaisCelular?: string;
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
  direccionHabitacion?: string;
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

  // Si ya viene en formato con guión (+58-...), limpiarlo y reformatearlo
  const dashMatch = rawTelefono.match(/^(\+\d{1,4})-(.*)$/);
  if (dashMatch) {
    const code = dashMatch[1];
    const number = dashMatch[2].replace(/\D/g, "");
    return `${code}-${number}`;
  }

  // Si ya viene en formato internacional sin guión, agregar el guión
  if (rawTelefono.startsWith("+")) {
    // Extraer el código de país usando códigos conocidos
    const countryCode = extractCountryCode(rawTelefono);
    const number = rawTelefono.slice(countryCode.length).replace(/\D/g, "");
    return `${countryCode}-${number}`;
  }

  // Si viene solo el número, concatenar con código país (o default +58)
  const rawCode = (input.codigoPaisCelular ?? "+58").toString().trim();
  const normalizedCode = rawCode.startsWith("+") ? rawCode : `+${rawCode}`;
  const onlyDigits = rawTelefono.replace(/\D/g, "");
  return `${normalizedCode}-${onlyDigits}`;
}

/**
 * Extrae el código de país de un número telefónico internacional.
 * Usa una lista de códigos conocidos ordenados por longitud (más largos primero).
 */
function extractCountryCode(phoneNumber: string): string {
  // Códigos de país comunes en Latinoamérica y otros, ordenados por longitud descendente
  const knownCodes = [
    '+1787', '+1809', '+1829', '+1849', // Puerto Rico, Rep. Dominicana
    '+598', '+595', '+593', '+592', '+591', '+507', '+506', '+505', '+504', '+503', '+502', '+501', // Latinoamérica 3 dígitos
    '+58', '+57', '+56', '+55', '+54', '+53', '+52', '+51', // Venezuela, Colombia, Chile, Brasil, Argentina, Cuba, México, Perú
    '+34', '+33', '+31', '+30', // España, Francia, etc.
    '+44', '+49', '+39', '+1', // UK, Alemania, Italia, USA/Canadá
  ];

  for (const code of knownCodes) {
    if (phoneNumber.startsWith(code)) {
      return code;
    }
  }

  // Fallback: tomar los primeros 3 caracteres (+XX) si no se reconoce
  const fallbackMatch = phoneNumber.match(/^(\+\d{1,3})/);
  return fallbackMatch ? fallbackMatch[1] : '+58';
}

/**
 * Busca un nivel educativo por su descripción
 * @param client - Cliente de base de datos
 * @param descripcion - Descripción del nivel educativo
 * @returns Nivel educativo encontrado
 * @throws {AppError} - Si el nivel educativo no existe en el catálogo
 */
async function findNivelEducativo(client: PoolClient, descripcion: string): Promise<Record<string, unknown>> {
  const findResult: QueryResult = await client.query(
    'SELECT * FROM niveles_educativos WHERE descripcion = $1 LIMIT 1',
    [descripcion]
  );

  if (findResult.rows.length > 0) {
    return findResult.rows[0] as Record<string, unknown>;
  }

  // Si no existe, lanzar error (los niveles educativos son un catálogo pre-definido)
  throw new AppError(
    `El nivel educativo "${descripcion}" no existe en el catálogo. Contacte al coordinador.`,
    400,
    'NIVEL_EDUCATIVO_NO_EXISTE'
  );
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
      logger.error("[SolicitantesService] Error fetching solicitantes:", error);
      if (error instanceof Error) {
        logger.error(`Error details: ${error.message}`);
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
  static async getSolicitanteById(cedula: string): Promise<Record<string, unknown> | null> {
    try {
      return await solicitantesQueries.getSolicitanteById(cedula);
    } catch (error) {
      logger.error("[SolicitantesService] Error fetching solicitante by id:", error);
      if (error instanceof Error) {
        logger.error(`Error details: ${error.message}`);
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
  static async getSolicitanteCompleto(cedula: string): Promise<SolicitanteCompleto | null> {
    try {
      return await solicitantesQueries.getSolicitanteCompleto(cedula);
    } catch (error) {
      logger.error('[SolicitantesService] Error fetching solicitante completo:', error);
      if (error instanceof Error) {
        logger.error(`Error details: ${error.message}`);
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
  create: async (data: ApplicantFormData, usuarioActualizo: string): Promise<Record<string, unknown>> => {
    // Validar fecha de nacimiento (no futura)
    if (data.fechaNacimiento) {
      const dateToCheck = new Date(data.fechaNacimiento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateToCheck > today) {
        throw new AppError('La fecha de nacimiento no puede ser futura', 400, 'VALIDATION_ERROR');
      }
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      // Establecer variable de sesión para auditoría
      if (usuarioActualizo) {
        await client.query("SELECT set_config('app.current_user_id', $1, true)", [usuarioActualizo]);
      }

      // 1. Crear o verificar solicitante básico
      // Construir cédula con formato V-XXXX (con guión)
      const cedula = `${data.cedulaTipo}-${data.cedulaNumero}`;
      // El formulario envía 'M' o 'F' directamente
      const sexo = data.sexo === 'M' || data.sexo === 'Masculino' ? 'M' : 'F';
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
      const nivelEducativoSolicitante = await findNivelEducativo(client, descripcionNivelSolicitante);

      // 3. Verificar si el solicitante ya existe
      const checkSolicitanteQuery = loadSQL('solicitantes/check-exists.sql');
      const solicitanteExistente = await client.query(checkSolicitanteQuery, [cedula]);

      if (solicitanteExistente.rows.length === 0) {
        // Verificar si el correo electrónico ya existe en otro solicitante antes de crear
        const checkEmailQuery = loadSQL('solicitantes/check-email-exists.sql');
        // Pasamos null como segundo parámetro porque es un registro nuevo
        const emailExistente = await client.query(checkEmailQuery, [data.correoElectronico, null]);

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
            data.direccionHabitacion || null,
          ]);
        } catch (error: unknown) {
          const pgError = error as { code?: string; constraint?: string };
          // Si es un error de unique constraint en correo_electronico
          if (pgError.code === '23505' && pgError.constraint === 'solicitantes_correo_electronico_unique') {
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
          // Pasamos null como segundo parámetro porque aquí solo queremos ver si existe
          const nuevoEmailExistente = await client.query(checkNuevoEmailQuery, [data.correoElectronico, null]);

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
        nivelEducativoJefeHogar = await findNivelEducativo(client, descripcionNivelJefe);
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
        data.direccionHabitacion || null, // direccion_habitacion
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
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      logger.error('Error al registrar solicitante', error);

      // Mejorar el mensaje de error para debugging
      const err = error as { message?: string; code?: string; detail?: string };
      const errorMessage = err?.message || 'Error desconocido';
      const errorCode = err?.code || 'UNKNOWN_ERROR';
      const errorDetail = err?.detail || '';

      const enhancedError = new Error(
        `Error al registrar solicitante: ${errorMessage}${errorDetail ? ` (${errorDetail})` : ''}`
      );
      Object.assign(enhancedError as unknown as Record<string, unknown>, {
        code: errorCode,
        detail: errorDetail,
      });

      throw enhancedError;
    } finally {
      client.release();
    }
  },

  /**
   * Actualiza un solicitante existente con todos sus datos completos
   */
  update: async (cedulaOriginal: string, data: ApplicantFormData, usuarioActualizo: string): Promise<Record<string, unknown>> => {
    // Validar fecha de nacimiento (no futura)
    if (data.fechaNacimiento) {
      const dateToCheck = new Date(data.fechaNacimiento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateToCheck > today) {
        throw new AppError('La fecha de nacimiento no puede ser futura', 400, 'VALIDATION_ERROR');
      }
    }

    // Validar formato de teléfono celular
    const phoneValue = (data.telefonoCelular || '').trim();
    if (phoneValue) {
      const codeMatch = phoneValue.match(/^(\+\d{1,4})/);
      const code = codeMatch ? codeMatch[1] : '';
      const number = phoneValue.slice(code.length).replace(/\D/g, '');

      if (code === '+58') {
        // Para números venezolanos (+58), el número debe tener 10 dígitos y empezar con 4
        if (number.length !== 10 || !number.startsWith('4')) {
          throw new AppError('Número venezolano inválido. Debe tener 10 dígitos y empezar con 4 (ej: 412...)', 400, 'VALIDATION_ERROR');
        }
      } else if (code) {
        // Para otros países, validar longitud mínima y máxima
        if (number.length < 7 || number.length > 15) {
          throw new AppError('Número de teléfono inválido', 400, 'VALIDATION_ERROR');
        }
      }
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      // Establecer variable de sesión para auditoría
      if (usuarioActualizo) {
        await client.query("SELECT set_config('app.current_user_id', $1, true)", [usuarioActualizo]);
      }

      // ========== OBTENER DATOS ANTERIORES PARA AUDITORÍA ==========
      const datosAnterioresResult = await client.query(`
        SELECT 
          s.*,
          fh.cant_personas, fh.cant_trabajadores, fh.cant_no_trabajadores,
          fh.cant_ninos, fh.cant_ninos_estudiando, fh.jefe_hogar,
          fh.ingresos_mensuales, fh.id_nivel_educativo_jefe,
          fh.tipo_tiempo_estudio_jefe, fh.tiempo_estudio_jefe,
          v.cant_habitaciones, v.cant_banos
        FROM solicitantes s
        LEFT JOIN familias_y_hogares fh ON s.cedula = fh.cedula_solicitante
        LEFT JOIN viviendas v ON s.cedula = v.cedula_solicitante
        WHERE s.cedula = $1
      `, [cedulaOriginal]);

      const datosAnteriores = datosAnterioresResult.rows[0] || {};

      // Obtener características actuales de vivienda (tipos 1-7)
      const caracteristicasResult = await client.query(`
        SELECT c.id_tipo_caracteristica, c.descripcion
        FROM asignadas_a a
        JOIN caracteristicas c ON a.id_tipo_caracteristica = c.id_tipo_caracteristica AND a.num_caracteristica = c.num_caracteristica
        WHERE a.cedula_solicitante = $1 AND c.id_tipo_caracteristica IN (1,2,3,4,5,6,7)
      `, [cedulaOriginal]);

      // Mapear características a un objeto para fácil acceso
      const caracteristicasMap: Record<number, string> = {};
      caracteristicasResult.rows.forEach(row => {
        caracteristicasMap[row.id_tipo_caracteristica] = row.descripcion;
      });

      // Agregar al objeto datosAnteriores
      datosAnteriores.tipo_vivienda = caracteristicasMap[1] || null;
      datosAnteriores.material_piso = caracteristicasMap[2] || null;
      datosAnteriores.material_paredes = caracteristicasMap[3] || null;
      datosAnteriores.material_techo = caracteristicasMap[4] || null;
      datosAnteriores.agua_potable = caracteristicasMap[5] || null;
      datosAnteriores.aseo = caracteristicasMap[6] || null;
      datosAnteriores.eliminacion_aguas_negras = caracteristicasMap[7] || null;

      // Obtener artefactos domésticos anteriores (tipo 8)
      const artefactosAnterioresResult = await client.query(`
        SELECT c.descripcion
        FROM asignadas_a a
        JOIN caracteristicas c ON a.id_tipo_caracteristica = c.id_tipo_caracteristica AND a.num_caracteristica = c.num_caracteristica
        WHERE a.cedula_solicitante = $1 AND c.id_tipo_caracteristica = 8
        ORDER BY c.descripcion
      `, [cedulaOriginal]);
      const artefactosAnteriores = artefactosAnterioresResult.rows.map(r => r.descripcion);
      datosAnteriores.artefactos_domesticos = artefactosAnteriores.join(', ') || null;

      // 1. Preparar datos básicos
      // Nota: No permitimos cambiar la cédula en la edición por ahora
      const cedula = cedulaOriginal;
      // Aunque datos vengan con cédula nueva, usamos la original como referencia

      // El formulario envía 'M' o 'F' directamente
      const sexo = data.sexo === 'M' || data.sexo === 'Masculino' ? 'M' : 'F';
      const telefonoCelularCompleto = buildTelefonoCelular({
        telefonoCelular: data.telefonoCelular,
        codigoPaisCelular: data.codigoPaisCelular,
      });

      // 2. IDs de trabajo y actividad
      let idTrabajo: number | null = null;
      let idActividad: number | null = null;

      if (data.trabaja === 'si' && data.condicionTrabajo) {
        const trabajoResult = await client.query(
          'SELECT id_trabajo FROM condicion_trabajo WHERE nombre_trabajo = $1 LIMIT 1',
          [data.condicionTrabajo]
        );
        idTrabajo = trabajoResult.rows[0]?.id_trabajo || null;
        idActividad = null;
      } else if (data.trabaja === 'no') {
        idTrabajo = 0;
        if (data.buscandoTrabajo === 'si') {
          idActividad = 0;
        } else if (data.condicionActividad) {
          const actividadResult = await client.query(
            'SELECT id_actividad FROM condicion_actividad WHERE nombre_actividad = $1 LIMIT 1',
            [data.condicionActividad]
          );
          idActividad = actividadResult.rows[0]?.id_actividad || null;
        }
      }

      // 3. Nivel educativo solicitante
      const descripcionNivelSolicitante = data.nivelEducativoSolicitante || getNivelEducativoDescripcion(data.numeroEducativoSolicitante || '0');
      const nivelEducativoSolicitante = await findNivelEducativo(client, descripcionNivelSolicitante);

      // 4. Actualizar datos básicos (Update Full)
      const updateFullQuery = loadSQL('solicitantes/update-full.sql');
      const estadoCivil = data.estadoCivil || null;
      const concubinato = data.concubinato === 'si' ? true : (data.concubinato === 'no' ? false : null);

      // Obtener tipo y tiempo de estudio del solicitante
      const tipoTiempoEstudioSolicitante = data.tipoTiempoEstudioSolicitante || null;
      const tiempoEstudioSolicitante = data.tiempoEstudioSolicitante ? parseInt(data.tiempoEstudioSolicitante) : null;

      const solicitanteResult = await client.query(updateFullQuery, [
        cedula, // $1
        data.nombres, // $2
        data.apellidos, // $3
        data.correoElectronico, // $4
        data.telefonoLocal || null, // $5
        telefonoCelularCompleto, // $6
        data.fechaNacimiento, // $7
        sexo, // $8
        estadoCivil, // $9
        concubinato, // $10
        tipoTiempoEstudioSolicitante, // $11
        tiempoEstudioSolicitante, // $12
        nivelEducativoSolicitante.id_nivel_educativo, // $13
        idTrabajo, // $14
        idActividad, // $15
        data.idEstado ? parseInt(data.idEstado) : 1, // $16
        data.numMunicipio ? parseInt(data.numMunicipio) : 1, // $17
        data.numParroquia ? parseInt(data.numParroquia) : 1, // $18
        data.direccionHabitacion || null, // $19
      ]);
      const solicitanteActualizado = solicitanteResult.rows[0];

      if (!solicitanteActualizado) {
        throw new AppError('Solicitante no encontrado para actualizar', 404, 'NOT_FOUND');
      }

      // 5. Vivienda (Upsert)
      const upsertViviendaQuery = loadSQL('viviendas/upsert.sql');
      const viviendaResult = await client.query(upsertViviendaQuery, [
        cedula,
        parseInt(data.cantHabitaciones),
        parseInt(data.cantBanos),
      ]);
      const vivienda = viviendaResult.rows[0];

      // 6. Nivel educativo jefe hogar
      let nivelEducativoJefeHogar = null;
      if (data.jefeHogar === 'no' && (data.nivelEducativo || data.numeroEducativo)) {
        const descripcionNivelJefe = data.nivelEducativo || getNivelEducativoDescripcion(data.numeroEducativo || '0');
        nivelEducativoJefeHogar = await findNivelEducativo(client, descripcionNivelJefe);
      }

      // 7. Familia/Hogar (Upsert)
      const upsertHogarQuery = loadSQL('familias-hogares/upsert.sql');
      const cantTrabajadores = parseInt(data.cantTrabajadores);
      const cantPersonas = parseInt(data.cantPersonas);
      const cantNoTrabajadores = cantPersonas - cantTrabajadores;

      const hogarResult = await client.query(upsertHogarQuery, [
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

      // 8. Características de vivienda (tipos 1-7): Delete & Re-insert
      // Solo borramos tipos 1,2,3,4,5,6,7 (vivienda) - NO el tipo 8 (artefactos)
      await client.query(
        'DELETE FROM asignadas_a WHERE cedula_solicitante = $1 AND id_tipo_caracteristica IN (1,2,3,4,5,6,7)',
        [cedula]
      );

      const guardarCaracteristica = async (descripcion: string, idTipo: number) => {
        if (!descripcion) return;
        const result = await client.query(
          'SELECT num_caracteristica FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND descripcion = $2 LIMIT 1',
          [idTipo, descripcion]
        );
        if (result.rows.length > 0) {
          await client.query(
            'INSERT INTO asignadas_a (cedula_solicitante, id_tipo_caracteristica, num_caracteristica) VALUES ($1, $2, $3)',
            [cedula, idTipo, result.rows[0].num_caracteristica]
          );
        }
      };

      await guardarCaracteristica(data.tipoVivienda, 1);
      await guardarCaracteristica(data.materialPiso, 2);
      await guardarCaracteristica(data.materialParedes, 3);
      await guardarCaracteristica(data.materialTecho, 4);
      await guardarCaracteristica(data.aguaPotable, 5);
      await guardarCaracteristica(data.aseo, 6);
      await guardarCaracteristica(data.eliminacionAguasN, 7);

      // NOTA: Artefactos domésticos se procesan DESPUÉS de insertar auditoría
      // para que el trigger pueda encontrar el registro existente

      // ========== INSERTAR AUDITORÍA CONSOLIDADA ==========
      // Obtener datos nuevos de familia y vivienda
      const datosNuevosResult = await client.query(`
        SELECT 
          fh.cant_personas, fh.cant_trabajadores, fh.cant_no_trabajadores,
          fh.cant_ninos, fh.cant_ninos_estudiando, fh.jefe_hogar,
          fh.ingresos_mensuales, fh.id_nivel_educativo_jefe,
          fh.tipo_tiempo_estudio_jefe, fh.tiempo_estudio_jefe,
          v.cant_habitaciones, v.cant_banos
        FROM familias_y_hogares fh
        LEFT JOIN viviendas v ON fh.cedula_solicitante = v.cedula_solicitante
        WHERE fh.cedula_solicitante = $1
      `, [cedula]);

      const datosNuevos = datosNuevosResult.rows[0] || {};

      // Insertar UN SOLO evento de auditoría con todo el perfil extendido del solicitante
      // (familia/hogar, vivienda, características, artefactos domésticos) — estas tablas
      // no tienen trigger genérico propio porque el "dueño" conceptual del cambio es el
      // solicitante, no cada tabla satélite. El cambio a las columnas propias de
      // `solicitantes` ya queda auditado aparte por el trigger genérico (entidad='solicitante').
      const perfilAnterior = {
        nombres: datosAnteriores.nombres, apellidos: datosAnteriores.apellidos,
        fecha_nacimiento: datosAnteriores.fecha_nacimiento,
        telefono_local: datosAnteriores.telefono_local, telefono_celular: datosAnteriores.telefono_celular,
        correo_electronico: datosAnteriores.correo_electronico,
        sexo: datosAnteriores.sexo, nacionalidad: datosAnteriores.nacionalidad,
        estado_civil: datosAnteriores.estado_civil, concubinato: datosAnteriores.concubinato,
        tipo_tiempo_estudio: datosAnteriores.tipo_tiempo_estudio, tiempo_estudio: datosAnteriores.tiempo_estudio,
        id_nivel_educativo: datosAnteriores.id_nivel_educativo,
        id_trabajo: datosAnteriores.id_trabajo, id_actividad: datosAnteriores.id_actividad,
        id_estado: datosAnteriores.id_estado, num_municipio: datosAnteriores.num_municipio,
        num_parroquia: datosAnteriores.num_parroquia,
        cant_personas: datosAnteriores.cant_personas, cant_trabajadores: datosAnteriores.cant_trabajadores,
        cant_no_trabajadores: datosAnteriores.cant_no_trabajadores,
        cant_ninos: datosAnteriores.cant_ninos, cant_ninos_estudiando: datosAnteriores.cant_ninos_estudiando,
        jefe_hogar: datosAnteriores.jefe_hogar,
        ingresos_mensuales: datosAnteriores.ingresos_mensuales,
        id_nivel_educativo_jefe: datosAnteriores.id_nivel_educativo_jefe,
        tipo_tiempo_estudio_jefe: datosAnteriores.tipo_tiempo_estudio_jefe,
        tiempo_estudio_jefe: datosAnteriores.tiempo_estudio_jefe,
        cant_habitaciones: datosAnteriores.cant_habitaciones, cant_banos: datosAnteriores.cant_banos,
        direccion_habitacion: datosAnteriores.direccion_habitacion,
        tipo_vivienda: datosAnteriores.tipo_vivienda, material_piso: datosAnteriores.material_piso,
        material_paredes: datosAnteriores.material_paredes, material_techo: datosAnteriores.material_techo,
        agua_potable: datosAnteriores.agua_potable, eliminacion_aguas_negras: datosAnteriores.eliminacion_aguas_negras,
        aseo: datosAnteriores.aseo,
        artefactos_domesticos: datosAnteriores.artefactos_domesticos,
      };
      const perfilNuevo = {
        nombres: data.nombres, apellidos: data.apellidos, fecha_nacimiento: data.fechaNacimiento,
        telefono_local: data.telefonoLocal || null, telefono_celular: telefonoCelularCompleto,
        correo_electronico: data.correoElectronico,
        sexo, nacionalidad: datosAnteriores.nacionalidad, estado_civil: estadoCivil, concubinato,
        tipo_tiempo_estudio: tipoTiempoEstudioSolicitante, tiempo_estudio: tiempoEstudioSolicitante,
        id_nivel_educativo: nivelEducativoSolicitante.id_nivel_educativo,
        id_trabajo: idTrabajo, id_actividad: idActividad,
        id_estado: data.idEstado ? parseInt(data.idEstado) : 1,
        num_municipio: data.numMunicipio ? parseInt(data.numMunicipio) : 1,
        num_parroquia: data.numParroquia ? parseInt(data.numParroquia) : 1,
        cant_personas: datosNuevos.cant_personas, cant_trabajadores: datosNuevos.cant_trabajadores,
        cant_no_trabajadores: datosNuevos.cant_no_trabajadores,
        cant_ninos: datosNuevos.cant_ninos, cant_ninos_estudiando: datosNuevos.cant_ninos_estudiando,
        jefe_hogar: datosNuevos.jefe_hogar,
        ingresos_mensuales: datosNuevos.ingresos_mensuales,
        id_nivel_educativo_jefe: datosNuevos.id_nivel_educativo_jefe,
        tipo_tiempo_estudio_jefe: datosNuevos.tipo_tiempo_estudio_jefe,
        tiempo_estudio_jefe: datosNuevos.tiempo_estudio_jefe,
        cant_habitaciones: datosNuevos.cant_habitaciones, cant_banos: datosNuevos.cant_banos,
        direccion_habitacion: data.direccionHabitacion || null,
        tipo_vivienda: data.tipoVivienda, material_piso: data.materialPiso,
        material_paredes: data.materialParedes, material_techo: data.materialTecho,
        agua_potable: data.aguaPotable, eliminacion_aguas_negras: data.eliminacionAguasN,
        aseo: data.aseo,
        artefactos_domesticos: data.artefactosDomesticos ? data.artefactosDomesticos.slice().sort().join(', ') : null,
      };

      await client.query(
        `INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, datos_nuevos)
         VALUES ('solicitante_perfil', 'actualizacion', $1, $2, $3, $4)`,
        [cedula, usuarioActualizo, JSON.stringify(perfilAnterior), JSON.stringify(perfilNuevo)]
      );

      // ========== ARTEFACTOS DOMÉSTICOS (después de auditoría) ==========
      // Se procesan DESPUÉS del INSERT de auditoría para que el trigger
      // pueda encontrar el registro existente y asociarle los artefactos
      if (data.artefactosDomesticos) {
        // Obtener artefactos actuales con sus IDs
        const artefactosActualesResult = await client.query(
          `SELECT a.num_caracteristica, c.descripcion 
           FROM asignadas_a a 
           JOIN caracteristicas c ON a.id_tipo_caracteristica = c.id_tipo_caracteristica AND a.num_caracteristica = c.num_caracteristica
           WHERE a.cedula_solicitante = $1 AND a.id_tipo_caracteristica = 8`,
          [cedula]
        );
        const artefactosActuales = new Set(artefactosActualesResult.rows.map(r => r.descripcion));
        const artefactosNuevos = new Set(data.artefactosDomesticos);

        // Encontrar los que se eliminaron (están en actuales pero no en nuevos)
        const artefactosAEliminar = [...artefactosActuales].filter(a => !artefactosNuevos.has(a));

        // Encontrar los que se agregaron (están en nuevos pero no en actuales)
        const artefactosAAgregar = [...artefactosNuevos].filter(a => !artefactosActuales.has(a));

        // Solo eliminar los que realmente se quitaron
        for (const artefactoNombre of artefactosAEliminar) {
          const numCaract = await client.query(
            'SELECT num_caracteristica FROM caracteristicas WHERE id_tipo_caracteristica = 8 AND descripcion = $1 LIMIT 1',
            [artefactoNombre]
          );
          if (numCaract.rows.length > 0) {
            await client.query(
              'DELETE FROM asignadas_a WHERE cedula_solicitante = $1 AND id_tipo_caracteristica = 8 AND num_caracteristica = $2',
              [cedula, numCaract.rows[0].num_caracteristica]
            );
          }
        }

        // Solo insertar los que realmente se agregaron
        for (const artefactoNombre of artefactosAAgregar) {
          await guardarCaracteristica(artefactoNombre, 8);
        }
      }

      await client.query('COMMIT');

      return {
        solicitante: solicitanteActualizado,
        vivienda,
        hogar,
      };

    } catch (error: unknown) {
      await client.query('ROLLBACK');
      logger.error('Error al actualizar solicitante', error);
      const err = error as { message?: string; code?: string };
      throw new AppError(
        `Error al actualizar solicitante: ${err?.message || 'Error desconocido'}`,
        500,
        err?.code || 'UNKNOWN'
      );
    } finally {
      client.release();
    }
  },

  delete: async (cedula: string, usuarioElimino: string, motivo: string): Promise<void> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Establecer variables de auditoría
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [usuarioElimino]);
      await client.query("SELECT set_config('app.audit_metadata', $1, true)", [JSON.stringify({ motivo })]);

      const deleteQuery = loadSQL('solicitantes/delete-by-id.sql');
      await client.query(deleteQuery, [cedula]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al eliminar solicitante', error);
      throw error;
    } finally {
      client.release();
    }
  },
};
