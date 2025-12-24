import { citasQueries } from '@/lib/db/queries/citas.queries';
import { AppError } from '@/lib/utils/errors';
import { readFileSync } from 'fs';
import { join } from 'path';

const createCitaQuery = readFileSync(
  join(process.cwd(), "database", "queries", "citas", "create.sql"),
  "utf-8"
);

/**
 * Servicio para la entidad Citas
 * Contiene la lógica de negocio para el módulo de Programación y Consultas
 */
export const citasService = {
  /**
   * Obtiene todas las citas formateadas para el frontend
   */
  async getAllAppointments(): Promise<
    Array<{
      id: string;
      title: string;
      date: Date;
      time: string;
      caseDetail: string;
      client: string;
      location: string;
    }>
  > {
    try {
      const citas = await citasQueries.getAll();

      return citas.map((cita) => {
        const fechaCita = new Date(cita.fecha_encuentro);
        const horas = fechaCita.getHours().toString().padStart(2, "0");
        const minutos = fechaCita.getMinutes().toString().padStart(2, "0");
        const time = `${horas}:${minutos}`;
        const client =
          cita.nombre_completo_solicitante ||
          `${cita.nombres_solicitante || ""} ${
            cita.apellidos_solicitante || ""
          }`.trim() ||
          cita.cedula;
        const caseDetail = `C-${cita.id_caso} (${client}) - ${cita.nombre_nucleo}`;
        const title = cita.nombre_materia || cita.tramite;

        return {
          id: `cita-${cita.num_cita}-${cita.id_caso}-${fechaCita.getTime()}`,
          title,
          date: fechaCita,
          time,
          caseDetail,
          client,
          location: cita.nombre_nucleo,
        };
      });
    } catch (error) {
      throw new AppError(
        "Error al obtener las citas",
        500,
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  },

  /**
   * Crea una nueva cita en la base de datos
   */
  async createAppointment(params: {
    caseId: string | number;
    date: string;
    endDate?: string;
    orientacion: string;
  }): Promise<{ num_cita: number; id_caso: number }> {
    try {
      const caseIdNumber = typeof params.caseId === 'string' ? parseInt(params.caseId, 10) : params.caseId;
      if (isNaN(caseIdNumber)) {
        throw new AppError('El ID del caso no es válido', 400);
      }
      const result = await citasQueries.create(
        createCitaQuery,
        caseIdNumber,
        params.date,
        params.endDate || null,
        params.orientacion
      );
      if (!result.rows || result.rows.length === 0) {
        throw new AppError("No se pudo crear la cita", 500);
      }
      return result.rows[0]; // { num_cita, id_caso }
    } catch (error) {
      // Log detallado para depuración
      // eslint-disable-next-line no-console
      console.error('Error al crear la cita (detalle DB):', error);
      throw new AppError(
        "Error al crear la cita",
        500,
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  },
};

