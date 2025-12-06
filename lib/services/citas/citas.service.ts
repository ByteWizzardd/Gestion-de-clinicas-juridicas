import { citasQueries } from '@/lib/db/queries/citas/citas.queries';
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
        const fechaCita = new Date(cita.fecha_cita);
        
        // Formatear hora como HH:mm
        const horas = fechaCita.getHours().toString().padStart(2, '0');
        const minutos = fechaCita.getMinutes().toString().padStart(2, '0');
        const time = `${horas}:${minutos}`;

        // Nombre completo del cliente
        const client = `${cita.nombres_cliente} ${cita.apellidos_cliente}`;

        // Detalle del caso: C-{id_caso} (Nombre Cliente) - Nombre Núcleo
        const caseDetail = `C-${cita.id_caso} (${cita.nombres_cliente} ${cita.apellidos_cliente}) - ${cita.nombre_nucleo}`;

        // Título: Materia del ámbito legal
        const title = cita.materia_ambito || cita.tramite;

        return {
          id: `cita-${cita.id_caso}-${fechaCita.getTime()}`,
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

