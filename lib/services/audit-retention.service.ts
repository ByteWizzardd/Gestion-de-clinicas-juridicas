import { pool } from '@/lib/db/pool';
import { loadSQL } from '@/lib/db/sql-loader';
import { logger } from '@/lib/utils/logger';

/**
 * Avisa a los Coordinadores de que hay registros de auditoría que ya cumplieron
 * su plazo de retención.
 *
 * Copia deliberada del patrón de lib/services/inactive-cases.service.ts: el
 * sistema NO borra nada por su cuenta, solo deja una notificación; al hacer
 * clic, Notification.tsx lleva a /dashboard/audit?purgeLogs=true, que abre la
 * pestaña de Mantenimiento con la vista previa y el botón de confirmar.
 */

/** Mismo título siempre: Notification.tsx lo usa para saber a dónde llevar. */
export const TITULO_NOTIFICACION_PURGA = 'Registros de auditoría por depurar';

interface ResumenClase {
    clase: string;
    etiqueta: string;
    eventos_purgables: string | number;
    meses_retencion: string | number;
}

export async function checkAndNotifyAuditRetention() {
    try {
        const resumenSql = loadSQL('auditoria-retencion/get-resumen.sql');
        const getCoordinatorsSql = loadSQL('usuarios/get-all-coordinators.sql');
        const createNotificationSql = loadSQL('notificaciones/create.sql');
        const existsUnreadSql = loadSQL('notificaciones/exists-unread.sql');

        const coordsResult = await pool.query(getCoordinatorsSql);
        const coordinadores = coordsResult.rows;

        if (coordinadores.length === 0) {
            return { success: false, message: 'No hay coordinadores habilitados a quienes avisar' };
        }

        const resumen: ResumenClase[] = (await pool.query(resumenSql)).rows;
        const vencidas = resumen.filter((c) => Number(c.eventos_purgables) > 0);
        const total = vencidas.reduce((suma, c) => suma + Number(c.eventos_purgables), 0);

        if (total === 0) {
            return { success: true, purgables: 0, notificationsSent: 0 };
        }

        const detalle = vencidas
            .map((c) => `${c.etiqueta.toLowerCase()} (${c.eventos_purgables})`)
            .join(', ');
        const titulo = TITULO_NOTIFICACION_PURGA;
        const mensaje =
            `Hay ${total} ${total === 1 ? 'registro de auditoría que superó' : 'registros de auditoría que superaron'} ` +
            `su plazo de conservación: ${detalle}. Haz clic aquí para revisarlos y depurarlos.`;

        // El emisor es el primer coordinador, igual que en el chequeo de casos
        // inactivos: la notificación es del sistema, no de una persona.
        const senderId = coordinadores[0].cedula;
        let notificationsSent = 0;

        for (const coord of coordinadores) {
            try {
                // exists-unread.sql compara título Y mensaje: si la cifra cambia
                // el aviso se renueva, si no, no se duplica.
                const existe = await pool.query(existsUnreadSql, [coord.cedula, titulo, mensaje]);
                if (existe.rowCount && existe.rowCount > 0) {
                    continue;
                }
                await pool.query(createNotificationSql, [coord.cedula, senderId, titulo, mensaje]);
                notificationsSent++;
            } catch (notifError) {
                logger.error(`Error notificando la depuración a ${coord.cedula}`, notifError);
            }
        }

        return { success: true, purgables: total, notificationsSent };
    } catch (error) {
        logger.error('Error en checkAndNotifyAuditRetention', error);
        return { success: false, error };
    }
}
