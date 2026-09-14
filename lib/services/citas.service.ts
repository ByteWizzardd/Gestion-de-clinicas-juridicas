import { citasQueries, type CitaCompleta } from '@/lib/db/queries/citas.queries';
import { AppError } from '@/lib/utils/errors';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { loadSQL } from '@/lib/db/sql-loader';
import { atiendenQueries } from '@/lib/db/queries/atienden.queries';
import { logger } from '@/lib/utils/logger';
import { toLocalISODate } from '@/lib/utils/date-formatter';
import type { PoolClient } from 'pg';
import { toUserMessage } from '@/lib/utils/error-messages';

/**
 * Registra el cambio de ejecutores de una acción como evento 'accion_ejecutores'
 * (misma forma que casos.service.ts): la tabla `ejecutan` no tiene trigger, y
 * la lectura de auditoría fusiona este evento con el de la acción de la misma
 * transacción.
 */
async function auditarEjecutores(
  client: PoolClient,
  operacion: 'actualizacion' | 'eliminacion',
  numAccion: number,
  idCaso: number,
  idUsuario: string,
  anteriores: Array<{ cedula: string; fecha_ejecucion: string | null }>,
  nuevos: Array<{ cedula: string; fecha_ejecucion: string | null }>,
  metadata?: Record<string, unknown>
) {
  const cedulas = [...new Set([...anteriores, ...nuevos].map(e => e.cedula))];
  const { rows } = await client.query(
    'SELECT cedula, nombres, apellidos FROM usuarios WHERE cedula = ANY($1)',
    [cedulas]
  );
  const nombres = new Map((rows as Array<{ cedula: string; nombres: string; apellidos: string }>).map(u => [u.cedula, u]));
  const conNombre = (lista: typeof anteriores) => lista.map(e => ({
    cedula: e.cedula,
    nombres: nombres.get(e.cedula)?.nombres ?? null,
    apellidos: nombres.get(e.cedula)?.apellidos ?? null,
    fecha_ejecucion: e.fecha_ejecucion,
  }));

  await client.query(
    `INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, datos_nuevos, metadata)
     VALUES ('accion_ejecutores', $1, $2, $3, $4, $5, $6)`,
    [
      operacion,
      `${numAccion}-${idCaso}`,
      idUsuario,
      JSON.stringify({ ejecutores: conNombre(anteriores) }),
      operacion === 'eliminacion' ? null : JSON.stringify({ ejecutores: conNombre(nuevos) }),
      metadata ? JSON.stringify(metadata) : null,
    ]
  );
}

type FilaEjecutor = { id_usuario: string; fecha_ejecucion: Date | string | null };

const fechaISO = (d: Date | string | null | undefined): string | null => {
  if (!d) return null;
  return typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);
};

/**
 * Servicio para la entidad Citas
 * Contiene la lógica de negocio para el módulo de Programación y Consultas
 */
export const citasService = {
  /**
   * Obtiene el id_caso y num_cita a partir del appointmentId
   */
  getCitaInfoByAppointmentId(appointmentId: string): { num_cita: number; id_caso: number } | null {
    const idParts = appointmentId.split('-');
    if (idParts.length < 3 || idParts[0] !== 'cita') return null;
    const num_cita = parseInt(idParts[1], 10);
    const id_caso = parseInt(idParts[2], 10);
    if (isNaN(num_cita) || isNaN(id_caso)) return null;
    return { num_cita, id_caso };
  },
  /**
   * Obtiene todas las citas formateadas para el frontend
   */
  async getAllAppointments(): Promise<
    Array<{
      id: string;
      title: string;
      date: Date;
      time: string;
      caseId: number;
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
          `${cita.nombres_solicitante || ""} ${cita.apellidos_solicitante || ""
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
          caseId: cita.id_caso,
          caseDetail,
          client,
          clientCedula: cita.cedula,
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
        toUserMessage(error, "Error al obtener las citas"),
        500,
        'CITA_ERROR'
      );
    }
  },

  /**
   * Obtiene las citas donde un usuario específico es parte de los que atienden
   */
  async getAppointmentsByUser(cedula: string): Promise<
    Array<{
      id: string;
      title: string;
      date: Date;
      time: string;
      caseId: number;
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
      const citas = await citasQueries.getByUsuario(cedula);

      return citas.map((cita: CitaCompleta) => {
        const fechaCita = new Date(cita.fecha_encuentro);
        const horas = fechaCita.getHours().toString().padStart(2, "0");
        const minutos = fechaCita.getMinutes().toString().padStart(2, "0");
        const time = `${horas}:${minutos}`;
        const client =
          cita.nombre_completo_solicitante ||
          `${cita.nombres_solicitante || ""} ${cita.apellidos_solicitante || ""
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
          caseId: cita.id_caso,
          caseDetail,
          client,
          clientCedula: cita.cedula,
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
        toUserMessage(error, "Error al obtener las citas del usuario"),
        500,
        'CITA_ERROR'
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
    idUsuarioRegistro: string; // Cedula del usuario que registra la cita
  }): Promise<{
    num_cita: number;
    id_caso: number;
  }> {
    try {
      const caseIdNumber = typeof params.caseId === 'string' ? parseInt(params.caseId, 10) : params.caseId;
      if (isNaN(caseIdNumber)) {
        throw new AppError('El ID del caso no es válido', 400);
      }

      // Usar transacción para crear cita y registros en atienden de forma atómica
      return await withAuditTransaction(
        params.idUsuarioRegistro,
        { accion_negocio: 'Registro de cita' },
        async (client) => {

        // 1. Crear la cita
        const createQuery = loadSQL('citas/create.sql');
        const citaResult = await client.query(createQuery, [
          caseIdNumber,
          params.date,
          params.endDate || null,
          params.orientacion,
          params.idUsuarioRegistro
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
      logger.error('Error al crear la cita (detalle DB):', error);
      throw new AppError(
        toUserMessage(error, "Error al crear la cita"),
        500,
        'CITA_ERROR'
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
    idUsuarioActualizo: string; // Cedula del usuario que actualiza la cita
  }): Promise<{ num_cita: number; id_caso: number; fecha: string }> {
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
      return await withAuditTransaction(
        params.idUsuarioActualizo,
        { accion_negocio: 'Actualización de cita' },
        async (client) => {
        // 0. Recolectar estado inicial para comparar
        const getCitaInfoQuery = loadSQL('citas/get-by-id.sql');
        const citaInfoResult = await client.query(getCitaInfoQuery, [num_cita, id_caso]);
        if (citaInfoResult.rows.length === 0) {
          throw new AppError("No se encontró la cita", 404);
        }
        const citaInfo = citaInfoResult.rows[0];

        const getAtiendenQuery = loadSQL('atienden/get-usuarios-by-cita.sql');
        const atiendenAnteriorResult = await client.query(getAtiendenQuery, [num_cita, id_caso]);
        const cedulasAnteriores = atiendenAnteriorResult.rows.map((r: Record<string, any>) => r.cedula).sort();

        // 1. Actualizar la cita si hay cambios en campos básicos. El trigger
        //    genérico de `citas` registra el diff real (solo si algo cambió).
        if (params.date || params.endDate !== undefined || params.orientacion) {
          const updateQuery = loadSQL('citas/update.sql');

          let endDateParam: string | null;
          if (params.endDate === null) {
            endDateParam = 'NULL';
          } else if (params.endDate !== undefined) {
            endDateParam = params.endDate;
          } else {
            endDateParam = null;
          }

          await client.query(updateQuery, [
            num_cita,
            id_caso,
            params.date || null,
            endDateParam,
            params.orientacion || null
          ]);
        }

        // 2. Reemplazar las personas que atienden solo si la lista cambió: el
        //    trigger de `atienden` audita cada fila borrada/insertada y la
        //    lectura las agrupa en una sola tarjeta con la cita.
        const cedulasNuevas = params.usuariosAtienden !== undefined
          ? [...new Set(params.usuariosAtienden)].sort()
          : cedulasAnteriores;
        const huboCambiosAtenciones = JSON.stringify(cedulasAnteriores) !== JSON.stringify(cedulasNuevas);

        if (huboCambiosAtenciones) {
          const deleteQuery = loadSQL('atienden/delete-by-cita.sql');
          await client.query(deleteQuery, [num_cita, id_caso]);

          if (cedulasNuevas.length > 0) {
            const createQuery = loadSQL('atienden/create.sql');
            for (const usuarioCedula of cedulasNuevas) {
              await client.query(createQuery, [
                usuarioCedula,
                num_cita,
                id_caso,
                null
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
                const ejecutoresAccionQuery = `
                  SELECT id_usuario_ejecuta as id_usuario, fecha_ejecucion
                  FROM ejecutan
                  WHERE num_accion = $1 AND id_caso = $2
                  ORDER BY id_usuario_ejecuta
                `;

                const ejecutoresAccionResult = await client.query(ejecutoresAccionQuery, [accion.num_accion, id_caso]);

                // Comparar con quienes atendían ANTES de este cambio: la lista de
                // atienden ya se reemplazó en el paso 2.
                const ejecutoresCita = cedulasAnteriores;
                const ejecutoresAccion = ejecutoresAccionResult.rows.map((r: Record<string, any>) => r.id_usuario).sort();

                const ejecutoresCoinciden = JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion);

                if (ejecutoresCoinciden) {
                  // ¡Esta acción corresponde a la cita! Actualizarla
                  let nuevoDetalle = accion.detalle_accion;
                  let nuevoComentario = accion.comentario;

                  // Si cambió la fecha, actualizar el detalle
                  if (params.date) {
                    // Parsear YYYY-MM-DD directamente sin new Date() para evitar desfase UTC
                    const [nuevoAnio, nuevoMes, nuevoDia] = params.date.split('-');
                    const nuevaFechaFormateada = `${nuevoDia}/${nuevoMes}/${nuevoAnio}`;
                    nuevoDetalle = `Cita realizada el ${nuevaFechaFormateada}`;
                  }

                  // Si cambió la orientación, actualizar el comentario
                  if (params.orientacion !== undefined) {
                    nuevoComentario = params.orientacion;
                  }

                  // Actualizar la acción usando client de la transacción
                  const updateAccionQuery = loadSQL('acciones/update.sql');
                  await client.query(updateAccionQuery, [accion.num_accion, id_caso, nuevoDetalle, nuevoComentario]);

                  // Si cambiaron quienes atienden, actualizar los ejecutores de la acción
                  if (huboCambiosAtenciones) {
                    const fechaEjecucion = params.date || fechaISO(cita.fecha_encuentro);

                    // Eliminar ejecutores existentes de la acción usando client
                    const deleteEjecutanQuery = loadSQL('ejecutan/delete-by-accion.sql');
                    await client.query(deleteEjecutanQuery, [accion.num_accion, id_caso]);

                    // Crear nuevos ejecutores si hay usuarios
                    if (cedulasNuevas.length > 0) {
                      const createEjecutanQuery = loadSQL('ejecutan/create.sql');
                      for (const usuarioCedula of cedulasNuevas) {
                        await client.query(createEjecutanQuery, [
                          usuarioCedula,
                          accion.num_accion,
                          id_caso,
                          fechaEjecucion
                        ]);
                      }
                    }

                    await auditarEjecutores(
                      client, 'actualizacion', accion.num_accion, id_caso, params.idUsuarioActualizo,
                      (ejecutoresAccionResult.rows as FilaEjecutor[]).map(r => ({ cedula: r.id_usuario, fecha_ejecucion: fechaISO(r.fecha_ejecucion) })),
                      cedulasNuevas.map(cedula => ({ cedula, fecha_ejecucion: fechaEjecucion }))
                    );
                  }

                  // Solo actualizar la primera acción que coincida (debería haber solo una)
                  break;
                }
              }
            }
          } catch {
            // No fallar la actualización de la cita por error en eliminación de acción
          }
        }

        // Obtener la fecha final de la cita (usar la actualizada o la existente)
        let finalDate = params.date;
        if (!finalDate) {
          // Si no se actualizó la fecha, obtener la fecha actual de la BD
          const getDateQuery = 'SELECT fecha_encuentro FROM citas WHERE num_cita = $1 AND id_caso = $2';
          const dateResult = await client.query(getDateQuery, [num_cita, id_caso]);
          if (dateResult.rows.length > 0) {
            finalDate = toLocalISODate(dateResult.rows[0].fecha_encuentro);
          }
        }

        return { num_cita, id_caso, fecha: finalDate || toLocalISODate() };
      });
    } catch (error) {
      logger.error('Error al actualizar la cita (detalle DB):', error);
      throw new AppError(
        toUserMessage(error, "Error al actualizar la cita"),
        500,
        'CITA_ERROR'
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
   * Elimina una cita existente y todos sus registros relacionados (registra auditoría antes de eliminar)
   */
  async deleteAppointment(params: {
    appointmentId: string; // Formato: "cita-{num_cita}-{id_caso}-{timestamp}"
    idUsuarioElimino: string; // Cedula del usuario que elimina la cita
    motivo: string; // Motivo de la eliminación
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
      return await withAuditTransaction(
        params.idUsuarioElimino,
        { accion_negocio: 'Eliminación de cita', motivo: params.motivo },
        async (client) => {
        // 1. Obtener información de la cita antes de eliminarla
        const getCitaQuery = loadSQL('citas/get-by-id.sql');
        const citaInfo = await client.query(getCitaQuery, [num_cita, id_caso]);

        let cita = null;
        if (citaInfo.rows.length !== 0) {
          cita = citaInfo.rows[0];
        }

        // 2. Buscar si hay una acción relacionada con esta cita
        try {
          if (cita) {
            // Convertir fecha al formato español DD/MM/YYYY para matching
            // Parsear YYYY-MM-DD directamente como string para evitar desfase UTC
            const fechaStr: string = typeof cita.fecha_encuentro === 'string'
              ? cita.fecha_encuentro.slice(0, 10)
              : (cita.fecha_encuentro as Date).toISOString().slice(0, 10);
            const [anio, mes, dia] = fechaStr.split('-');
            const fechaFormateada = `${dia}/${mes}/${anio}`;


            // Buscar TODAS las acciones relacionadas con citas para este caso
            // Luego verificar cuál corresponde exactamente a esta cita
            const findAccionesQuery = `
              SELECT a.num_accion, a.id_caso, a.detalle_accion, a.comentario, a.id_usuario_registra, a.fecha_registro
              FROM acciones a
              WHERE a.id_caso = $1::INTEGER
                AND a.detalle_accion LIKE 'Cita realizada el %'
            `;

            const accionesResult = await client.query(findAccionesQuery, [id_caso]);


            // Para cada acción de cita, verificar si corresponde a esta cita por ejecutores
            let accionRelacionada = null;
            for (const accion of accionesResult.rows) {

              // Verificar que los ejecutores también coincidan (comparación adicional de seguridad)
              const ejecutoresCitaQuery = `
                SELECT id_usuario
                FROM atienden
                WHERE num_cita = $1::INTEGER AND id_caso = $2::INTEGER
                ORDER BY id_usuario
              `;

              const ejecutoresAccionQuery = `
                SELECT id_usuario_ejecuta as id_usuario, fecha_ejecucion
                FROM ejecutan
                WHERE num_accion = $1::INTEGER AND id_caso = $2::INTEGER
                ORDER BY id_usuario_ejecuta
              `;

              const [ejecutoresCitaResult, ejecutoresAccionResult] = await Promise.all([
                client.query(ejecutoresCitaQuery, [num_cita, id_caso]),
                client.query(ejecutoresAccionQuery, [accion.num_accion, id_caso])
              ]);

              // Comparar listas de ejecutores
              const ejecutoresCita = ejecutoresCitaResult.rows.map((r: Record<string, any>) => r.id_usuario).sort();
              const ejecutoresAccion = ejecutoresAccionResult.rows.map((r: Record<string, any>) => r.id_usuario).sort();

              const ejecutoresCoinciden = JSON.stringify(ejecutoresCita) === JSON.stringify(ejecutoresAccion);


              if (ejecutoresCoinciden) {
                // ¡Esta acción corresponde a la cita!
                accionRelacionada = { ...accion, ejecutores: ejecutoresAccionResult.rows };
                break; // Salir del loop, ya encontramos la acción correcta
              }
            }

            // Eliminar la acción encontrada (si existe)
            if (accionRelacionada) {

              // Eliminar ejecutores primero usando client de la transacción
              const deleteEjecutanQuery = loadSQL('ejecutan/delete-by-accion.sql');
              await client.query(deleteEjecutanQuery, [accionRelacionada.num_accion, id_caso]);

              if (accionRelacionada.ejecutores.length > 0) {
                await auditarEjecutores(
                  client, 'eliminacion', accionRelacionada.num_accion, id_caso, params.idUsuarioElimino,
                  (accionRelacionada.ejecutores as FilaEjecutor[]).map(r => ({ cedula: r.id_usuario, fecha_ejecucion: fechaISO(r.fecha_ejecucion) })),
                  [],
                  { motivo: params.motivo }
                );
              }

              // Eliminar la acción usando client de la transacción
              const deleteAccionQuery = loadSQL('acciones/delete.sql');
              await client.query(deleteAccionQuery, [accionRelacionada.num_accion, id_caso]);

            }
          }
        } catch {
          // No fallar la eliminación de la cita por error en eliminación de acción
        }

        // 4. Eliminar todos los registros de atienden relacionados con esta cita
        const deleteAtiendenQuery = loadSQL('atienden/delete-by-cita.sql');
        await client.query(deleteAtiendenQuery, [num_cita, id_caso]);

        // 5. Eliminar la cita (el trigger capturará la auditoría usando OLD)
        const deleteCitaQuery = loadSQL('citas/delete.sql');
        const citaResult = await client.query(deleteCitaQuery, [num_cita, id_caso]);

        if (!citaResult.rows || citaResult.rows.length === 0) {
          throw new AppError("No se pudo eliminar la cita. Verifique que la cita existe.", 404);
        }

        return { num_cita, id_caso };
      });
    } catch (error) {
      logger.error('Error al eliminar la cita (detalle DB):', error);
      throw new AppError(
        toUserMessage(error, "Error al eliminar la cita"),
        500,
        'CITA_ERROR'
      );
    }
  },

  /**
   * Obtiene las cédulas de los usuarios que atienden una cita a partir del appointmentId
   * (Formato: "cita-{num_cita}-{id_caso}-{timestamp}")
   */
  async getUsuariosAtiendenByAppointmentId(appointmentId: string): Promise<{ id_caso: number; usuariosAtienden: string[] } | null> {
    const citaInfo = this.getCitaInfoByAppointmentId(appointmentId);
    if (!citaInfo) {
      throw new AppError('ID de cita inválido', 400);
    }
    const { num_cita, id_caso } = citaInfo;
    const atenciones = await atiendenQueries.getByCita(num_cita, id_caso);
    const usuariosAtienden = Array.from(
      new Set(
        atenciones
          .map((a) => a.id_usuario)
          .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      )
    );
    return { id_caso, usuariosAtienden };
  },
};

