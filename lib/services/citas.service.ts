import { citasQueries } from '@/lib/db/queries/citas.queries';
import { AppError } from '@/lib/utils/errors';

/**
 * Servicio para la entidad Citas
 * Contiene la lógica de negocio para el módulo de Programación y Consultas
 */
export const citasService = {
  /**
   * Obtiene todas las citas formateadas para el frontend
   * Transforma los datos de la BD al formato esperado por el componente Appointment
   */
  getAllAppointments: async () => {
    try {
      const citas = await citasQueries.getAll();

      // Transformar los datos al formato esperado por el frontend
      const appointments = citas.map((cita) => {
        const fechaCita = new Date(cita.fecha_encuentro);
        
        // Formatear hora como HH:mm
        const horas = fechaCita.getHours().toString().padStart(2, '0');
        const minutos = fechaCita.getMinutes().toString().padStart(2, '0');
        const time = `${horas}:${minutos}`;

        // Nombre completo del solicitante
        const client = cita.nombre_completo_solicitante || 
          `${cita.nombres_solicitante || ''} ${cita.apellidos_solicitante || ''}`.trim() || 
          cita.cedula;

        // Detalle del caso: C-{id_caso} (Nombre Solicitante) - Nombre Núcleo
        const caseDetail = `C-${cita.id_caso} (${client}) - ${cita.nombre_nucleo}`;

        // Título: Materia del ámbito legal
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

      return appointments;
    } catch (error) {
      throw new AppError(
        'Error al obtener las citas',
        500,
        error instanceof Error ? error.message : 'Error desconocido'
      );
    }
  },
};

