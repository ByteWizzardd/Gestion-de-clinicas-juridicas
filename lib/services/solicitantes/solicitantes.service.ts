import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { QueryResult } from 'pg';
import { logger } from '@/lib/utils/logger';

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
  artefactos: string[];
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

export const solicitantesService = {
  /**
   * Registra un nuevo solicitante con todos sus datos
   */
  create: async (data: ApplicantFormData): Promise<any> => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Crear o verificar cliente básico
      const cedula = `${data.cedulaTipo}${data.cedulaNumero}`;
      const sexo = data.sexo === 'Masculino' ? 'M' : 'F';
      const nacionalidad = 'V'; // Por defecto venezolano
      
      // Verificar si el cliente ya existe
      const clienteExistente = await client.query(
        'SELECT * FROM clientes WHERE cedula = $1',
        [cedula]
      );
      
      if (clienteExistente.rows.length === 0) {
        // Crear cliente básico
        const createClienteQuery = loadSQL('auth/create-cliente.sql');
        await client.query(createClienteQuery, [
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
        data.tipoVivienda,
        parseInt(data.cantHabitaciones),
        parseInt(data.cantBanos),
        data.materialPiso,
        data.materialParedes,
        data.materialTecho,
        data.aguaPotable,
        data.eliminacionAguasN,
        data.aseo,
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

      // 5. Crear trabajo
      const trabaja = data.trabaja === 'si';
      const buscandoTrabajo = data.buscandoTrabajo === 'si';
      
      // Determinar valores según la lógica del formulario
      let condicionActividad: string | null = null;
      let condicionTrabajo: string | null = null;
      
      if (trabaja) {
        // Si trabaja, necesita condicion_trabajo
        condicionTrabajo = data.condicionTrabajo || null;
        // condicion_actividad es null cuando trabaja
      } else if (buscandoTrabajo) {
        // Si no trabaja pero busca trabajo, ambos son null
        condicionActividad = null;
        condicionTrabajo = null;
      } else {
        // Si no trabaja y no busca trabajo, necesita condicion_actividad
        condicionActividad = data.condicionActividad || null;
        // condicion_trabajo es null cuando no trabaja
      }
      
      const createTrabajoQuery = loadSQL('trabajos/create.sql');
      const trabajoResult: QueryResult = await client.query(createTrabajoQuery, [
        condicionActividad,
        buscandoTrabajo,
        condicionTrabajo,
      ]);
      const trabajo = trabajoResult.rows[0];

      // 6. Crear familia y hogar
      const createHogarQuery = loadSQL('familias-hogares/create.sql');
      const hogarResult: QueryResult = await client.query(createHogarQuery, [
        parseInt(data.cantPersonas),
        parseInt(data.cantTrabajadores),
        parseInt(data.cantNinos),
        parseInt(data.cantNinosEstudiando),
        data.jefeHogar === 'si',
        nivelEducativoJefeHogar?.id_nivel_educativo || null,
        parseFloat(data.ingresosMensuales),
      ]);
      const hogar = hogarResult.rows[0];

      // 7. Crear artefactos domésticos
      if (data.artefactos && data.artefactos.length > 0) {
        const createArtefactoQuery = loadSQL('artefactos-domesticos/create.sql');
        for (const artefacto of data.artefactos) {
          await client.query(createArtefactoQuery, [hogar.id_hogar, artefacto]);
        }
      }

      // 8. Actualizar cliente con todos los datos
      const estadoCivil = data.estadoCivil || null;
      const concubinato = data.concubinato === 'si' ? true : (data.concubinato === 'no' ? false : null);
      
      const updateClienteQuery = loadSQL('clientes/update-complete.sql');
      const clienteResult: QueryResult = await client.query(updateClienteQuery, [
        cedula,
        data.telefonoLocal || null,
        `${data.codigoPaisCelular}${data.telefonoCelular}`,
        estadoCivil,
        concubinato,
        hogar.id_hogar,
        nivelEducativoSolicitante.id_nivel_educativo,
        trabajo.id_trabajo,
        vivienda.id_vivienda,
      ]);
      const clienteActualizado = clienteResult.rows[0];

      await client.query('COMMIT');
      
      return {
        cliente: clienteActualizado,
        vivienda,
        nivelEducativo: nivelEducativoSolicitante,
        trabajo,
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
