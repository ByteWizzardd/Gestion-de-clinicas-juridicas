import { citasQueries, type CitaCompleta } from '@/lib/db/queries/citas.queries';
import { AppError } from '@/lib/utils/errors';
import { withTransaction } from '@/lib/db/transactions';
import { loadSQL } from '@/lib/db/sql-loader';

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
      orientation: string;
      attendingUsers: string;
      attendingUsersList: Array<{
        id_usuario: string;
        nombres: string;
        apellidos: string;
        nombre_completo: string;
        fecha_registro: string;
      }>;
      isMultiplePeople: boolean;
      nextAppointmentDate?: string | null;
    }>
  > {
    try {
      const citas = await citasQueries.getAll();

      return citas.map((cita: CitaCompleta) => {
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

        // Detalle del caso: C-{id_caso} (Nombre Solicitante) - Nombre Núcleo
        const caseDetail = `C-${cita.id_caso} (${client}) - ${cita.nombre_nucleo}`;

        // Título: Materia del ámbito legal
        const title = cita.nombre_materia || cita.tramite;

        // Usuarios que atendieron (ahora es un array)
        const atenciones = cita.atenciones || [];
        const attendingUsersNames = atenciones.length > 0
          ? atenciones.map(a => a.nombre_completo).join(', ')
          : 'No especificado';
        const isMultiplePeople = atenciones.length > 1;

        // Fecha de próxima cita formateada
        const nextAppointmentDate = cita.fecha_proxima_cita
          ? (() => {
              const nextDate = new Date(cita.fecha_proxima_cita);
              const day = String(nextDate.getDate()).padStart(2, '0');
              const month = String(nextDate.getMonth() + 1).padStart(2, '0');
              const year = nextDate.getFullYear();
              return `${day}/${month}/${year}`;
            })()
          : null;

        return {
          id: `cita-${cita.num_cita}-${cita.id_caso}-${fechaCita.getTime()}`,
          title,
          date: fechaCita,
          time,
          caseDetail,
          client,
          location: cita.nombre_nucleo,
          orientation: cita.orientacion || 'Sin orientación especificada',
          attendingUsers: attendingUsersNames,
          attendingUsersList: atenciones, // Array completo para uso detallado
          isMultiplePeople,
          nextAppointmentDate,
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
   * Crea una nueva cita en la base de datos y registra los usuarios que atendieron
   */
  async createAppointment(params: {
    caseId: string | number;
    date: string;
    endDate?: string;
    orientacion: string;
    usuariosAtienden?: string[];
  }): Promise<{ num_cita: number; id_caso: number }> {
    try {
      const caseIdNumber = typeof params.caseId === 'string' ? parseInt(params.caseId, 10) : params.caseId;
      if (isNaN(caseIdNumber)) {
        throw new AppError('El ID del caso no es válido', 400);
      }

      // Usar transacción para crear cita y registros en atienden de forma atómica
      return await withTransaction(async (client) => {
        // 1. Crear la cita
        const createQuery = loadSQL('citas/create.sql');
        const citaResult = await client.query(createQuery, [
          caseIdNumber,
          params.date,
          params.endDate || null,
          params.orientacion
        ]);

        if (!citaResult.rows || citaResult.rows.length === 0) {
          throw new AppError("No se pudo crear la cita", 500);
        }

        const { num_cita, id_caso } = citaResult.rows[0];

        // 2. Crear registros en atienden si hay usuarios seleccionados
        if (params.usuariosAtienden && params.usuariosAtienden.length > 0) {
          const atiendenQuery = loadSQL('atienden/create.sql');
          
          for (const usuarioCedula of params.usuariosAtienden) {
            await client.query(atiendenQuery, [
              usuarioCedula,
              num_cita,
              id_caso,
              null // fecha_registro se usa CURRENT_DATE por defecto
            ]);
          }
        }

        // Si todo sale bien, la transacción hace COMMIT automáticamente
        // Si hay error, hace ROLLBACK automáticamente
        return { num_cita, id_caso };
      });
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

  /**
   * Actualiza una cita existente y sus usuarios que atendieron
   */
  async updateAppointment(params: {
    appointmentId: string; // Formato: "cita-{num_cita}-{id_caso}-{timestamp}"
    date?: string;
    endDate?: string | null;
    orientacion?: string;
    usuariosAtienden?: string[];
  }): Promise<{ num_cita: number; id_caso: number }> {
    try {
      // Parsear el ID del appointment para obtener num_cita e id_caso
      // Formato: "cita-{num_cita}-{id_caso}-{timestamp}"
      const idParts = params.appointmentId.split('-');
      if (idParts.length < 3 || idParts[0] !== 'cita') {
        throw new AppError('ID de cita inválido', 400);
      }

      const num_cita = parseInt(idParts[1], 10);
      const id_caso = parseInt(idParts[2], 10);

      if (isNaN(num_cita) || isNaN(id_caso)) {
        throw new AppError('ID de cita inválido: no se pudieron extraer num_cita e id_caso', 400);
      }

      // Usar transacción para actualizar cita y registros en atienden de forma atómica
      return await withTransaction(async (client) => {
        // 1. Actualizar la cita si hay cambios
        if (params.date || params.endDate !== undefined || params.orientacion) {
          const updateQuery = loadSQL('citas/update.sql');
          
          // Manejar fecha_proxima_cita: si es null explícitamente, enviar 'NULL' como string
          // Si es undefined, enviar null para no actualizar
          let endDateParam: string | null;
          if (params.endDate === null) {
            endDateParam = 'NULL'; // String especial para establecer como NULL
          } else if (params.endDate !== undefined) {
            endDateParam = params.endDate;
          } else {
            endDateParam = null; // No actualizar
          }
          
          const citaResult = await client.query(updateQuery, [
            num_cita,
            id_caso,
            params.date || null,
            endDateParam,
            params.orientacion || null
          ]);

          if (!citaResult.rows || citaResult.rows.length === 0) {
            throw new AppError("No se pudo actualizar la cita. Verifique que la cita existe.", 404);
          }
        }

        // 2. Actualizar registros en atienden si se proporcionaron usuarios
        if (params.usuariosAtienden !== undefined) {
          // Primero eliminar todos los registros existentes
          const deleteQuery = loadSQL('atienden/delete-by-cita.sql');
          await client.query(deleteQuery, [num_cita, id_caso]);

          // Luego crear los nuevos registros si hay usuarios seleccionados
          if (params.usuariosAtienden.length > 0) {
            const createQuery = loadSQL('atienden/create.sql');

            for (const usuarioCedula of params.usuariosAtienden) {
              await client.query(createQuery, [
                usuarioCedula,
                num_cita,
                id_caso,
                null // fecha_registro se usa CURRENT_DATE por defecto
              ]);
            }
          }
        }

        // 3. Sincronización bidireccional: Si la cita está registrada como acción, actualizarla también
        if (params.date || params.orientacion || params.usuariosAtienden) {
          try {
            // Obtener la cita actualizada para buscar la acción
            const getCitaQuery = loadSQL('citas/get-by-id.sql');
            const citaActualizada = await client.query(getCitaQuery, [num_cita, id_caso]);

            if (citaActualizada.rows.length > 0) {
              const cita = citaActualizada.rows[0];
              const { accionesQueries } = await import('@/lib/db/queries/acciones.queries');
              const { ejecutanQueries } = await import('@/lib/db/queries/ejecutan.queries');

              // Buscar TODAS las acciones relacionadas con citas para este caso
              // Luego verificar cuál corresponde exactamente a esta cita por ejecutores
              const findAccionesQuery = `
                SELECT a.num_accion, a.id_caso, a.detalle_accion, a.comentario, a.id_usuario_registra, a.fecha_registro
                FROM acciones a
                WHERE a.id_caso = $1
                  AND a.detalle_accion LIKE 'Cita realizada el %'
              `;

              const accionesResult = await client.query(findAccionesQuery, [id_caso]);

              // Para cada acción de cita, verificar si corresponde a esta cita por ejecutores
              for (const accion of accionesResult.rows) {
                // Comparar ejecutores para identificar cuál acción corresponde a esta cita
                const ejecutoresCitaQuery = `
                  SELECT id_usuario
                  FROM atienden
                  WHERE num_cita = $1 AND id_caso = $2
                  ORDER BY id_usuario
                `;

                const ejecutoresAccionQuery = `
                  SELECT id_usuario_ejecuta as id_usuario
                  FROM ejecutan
                  WHERE num_accion = $1 AND id_caso = $2
                  ORDER BY id_usuario_ejecuta
                `;

                const [ejecutoresCitaResult, ejecutoresAccionResult] = await Promise.all([
                  client.query(ejecutoresCitaQuery, [num_cita, id_caso]),
                  client.query(ejecutoresAccionQuery, [accion.num_accion, id_caso])
                ]);

                // Comparar listas de ejecutores ordenadas
                const ejecutoresCita = ejecutoresCitaResult.rows.map(r => r.id_usuario).sort();
                const ejecutoresAccion = ejecutoresAccionResult.rows.map(r => r.id_usuario).sort();

                const ejecutoresCoinciden = JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion);

                if (ejecutoresCoinciden) {
                  // ¡Esta acción corresponde a la cita! Actualizarla
                  let nuevoDetalle = accion.detalle_accion;
                  let nuevoComentario = accion.comentario;

                  // Si cambió la fecha, actualizar el detalle
                  if (params.date) {
                    const nuevaFechaObj = new Date(params.date);
                    const nuevoDia = String(nuevaFechaObj.getDate()).padStart(2, '0');
                    const nuevoMes = String(nuevaFechaObj.getMonth() + 1).padStart(2, '0');
                    const nuevoAnio = nuevaFechaObj.getFullYear();
                    const nuevaFechaFormateada = `${nuevoDia}/${nuevoMes}/${nuevoAnio}`;
                    nuevoDetalle = `Cita realizada el ${nuevaFechaFormateada}`;
                  }

                  // Si cambió la orientación, actualizar el comentario
                  if (params.orientacion !== undefined) {
                    nuevoComentario = params.orientacion;
                  }

                  // Actualizar la acción
                  await accionesQueries.update(accion.num_accion, id_caso, nuevoDetalle, nuevoComentario);

                  // Si cambiaron los ejecutores, actualizar los ejecutores de la acción
                  if (params.usuariosAtienden !== undefined) {
                    // Eliminar ejecutores existentes de la acción
                    await ejecutanQueries.deleteByAccion(accion.num_accion, id_caso);

                    // Crear nuevos ejecutores si hay usuarios
                    if (params.usuariosAtienden.length > 0) {
                      const createEjecutanQuery = loadSQL('ejecutan/create.sql');
                      for (const usuarioCedula of params.usuariosAtienden) {
                        const fechaEjecucion = params.date || cita.fecha_encuentro;
                        await client.query(createEjecutanQuery, [
                          usuarioCedula,
                          accion.num_accion,
                          id_caso,
                          fechaEjecucion
                        ]);
                      }
                    }
                  }

                  // Solo actualizar la primera acción que coincida (debería haber solo una)
                  break;
                }
              }
            }
          } catch (error) {
            // No fallar la actualización de la cita por error en eliminación de acción
          }
        }

        return { num_cita, id_caso };
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al actualizar la cita (detalle DB):', error);
      throw new AppError(
        "Error al actualizar la cita",
        500,
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  },

  /**
   * Busca una acción relacionada con una cita específica
   */
  async findAccionByCita(
    idCaso: number,
    fechaCita: string,
    orientacion: string
  ): Promise<{
    num_accion: number;
    id_caso: number;
    detalle_accion: string;
    comentario: string | null;
    id_usuario_registra: string;
    fecha_registro: string;
  } | null> {
    const { accionesQueries } = await import('@/lib/db/queries/acciones.queries');
    return await accionesQueries.findByCita(idCaso, fechaCita, orientacion);
  },

  /**
   * Elimina una cita existente y todos sus registros relacionados
   */
  async deleteAppointment(params: {
    appointmentId: string; // Formato: "cita-{num_cita}-{id_caso}-{timestamp}"
  }): Promise<{ num_cita: number; id_caso: number }> {
    try {
      // Parsear el ID del appointment para obtener num_cita e id_caso
      // Formato: "cita-{num_cita}-{id_caso}-{timestamp}"
      const idParts = params.appointmentId.split('-');
      if (idParts.length < 3 || idParts[0] !== 'cita') {
        throw new AppError('ID de cita inválido', 400);
      }

      const num_cita = parseInt(idParts[1], 10);
      const id_caso = parseInt(idParts[2], 10);

      if (isNaN(num_cita) || isNaN(id_caso)) {
        throw new AppError('ID de cita inválido: no se pudieron extraer num_cita e id_caso', 400);
      }

      // Usar transacción para eliminar registros relacionados y la cita de forma atómica
      return await withTransaction(async (client) => {
        // 1. Obtener información de la cita antes de eliminarla
        const getCitaQuery = loadSQL('citas/get-by-id.sql');
        const citaInfo = await client.query(getCitaQuery, [num_cita, id_caso]);

        let cita = null;
        if (citaInfo.rows.length === 0) {
          // Si la cita no existe, intentar eliminar de todas formas los registros relacionados
          // por si quedaron huérfanos
        } else {
          cita = citaInfo.rows[0];
        }

        // 2. Buscar si hay una acción relacionada con esta cita
        try {
          if (cita) {
            // Convertir fecha al formato español DD/MM/YYYY para matching
            const fechaObj = new Date(cita.fecha_encuentro);
            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            const anio = fechaObj.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${anio}`;

            // Buscar acciones que coincidan exactamente con:
            // 1. Fecha en detalle_accion
            // 2. Comentario (orientación)
            // 3. Caso específico
            const findAccionQuery = `
              SELECT a.num_accion, a.id_caso, a.detalle_accion, a.comentario, a.id_usuario_registra, a.fecha_registro
              FROM acciones a
              WHERE a.id_caso = $1::INTEGER
                AND a.detalle_accion = 'Cita realizada el ' || $2::TEXT
                AND (a.comentario = $3::TEXT OR (a.comentario IS NULL AND $3::TEXT IS NULL))
              ORDER BY a.fecha_registro DESC, a.num_accion DESC
              LIMIT 1
            `;

            const accionResult = await client.query(findAccionQuery, [id_caso, fechaFormateada, cita.orientacion]);

            if (accionResult.rows.length > 0) {
              const accionRelacionada = accionResult.rows[0];

              // Verificar que los ejecutores también coincidan (comparación adicional de seguridad)
              const ejecutoresCitaQuery = `
                SELECT id_usuario
                FROM atienden
                WHERE num_cita = $1::INTEGER AND id_caso = $2::INTEGER
                ORDER BY id_usuario
              `;

              const ejecutoresAccionQuery = `
                SELECT id_usuario_ejecuta as id_usuario
                FROM ejecutan
                WHERE num_accion = $1::INTEGER AND id_caso = $2::INTEGER
                ORDER BY id_usuario_ejecuta
              `;

              const [ejecutoresCitaResult, ejecutoresAccionResult] = await Promise.all([
                client.query(ejecutoresCitaQuery, [num_cita, id_caso]),
                client.query(ejecutoresAccionQuery, [accionRelacionada.num_accion, id_caso])
              ]);

              // Comparar listas de ejecutores
              const ejecutoresCita = ejecutoresCitaResult.rows.map(r => r.id_usuario).sort();
              const ejecutoresAccion = ejecutoresAccionResult.rows.map(r => r.id_usuario).sort();

              const ejecutoresCoinciden = JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion);

              if (ejecutoresCoinciden) {
                // Solo eliminar si todo coincide: fecha, comentario y ejecutores
                const { ejecutanQueries } = await import('@/lib/db/queries/ejecutan.queries');
                await ejecutanQueries.deleteByAccion(accionRelacionada.num_accion, id_caso);

                const { accionesQueries } = await import('@/lib/db/queries/acciones.queries');
                await accionesQueries.delete(accionRelacionada.num_accion, id_caso);
              }
            }
          }
        } catch (error) {
          // No fallar la eliminación de la cita por error en eliminación de acción
        }

        // 4. Eliminar todos los registros de atienden relacionados con esta cita
        const deleteAtiendenQuery = loadSQL('atienden/delete-by-cita.sql');
        await client.query(deleteAtiendenQuery, [num_cita, id_caso]);

        // 5. Eliminar la cita
        const deleteCitaQuery = loadSQL('citas/delete.sql');
        const citaResult = await client.query(deleteCitaQuery, [num_cita, id_caso]);

        if (!citaResult.rows || citaResult.rows.length === 0) {
          throw new AppError("No se pudo eliminar la cita. Verifique que la cita existe.", 404);
        }

        return { num_cita, id_caso };
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al eliminar la cita (detalle DB):', error);
      throw new AppError(
        "Error al eliminar la cita",
        500,
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  },
};

