import { pool } from '@/lib/db/pool';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '@/lib/utils/logger';

/**
 * Servicio para detectar casos inactivos y notificar a los usuarios correspondientes.
 * Se basa en la lógica original de scripts/check-inactive-cases.mjs
 */
export async function checkAndNotifyInactiveCases() {
    try {
        // 1. Cargar Queries
        const queriesDir = join(process.cwd(), 'database/queries');


        // Casos Inactivos
        const getInactiveCasesSql = readFileSync(
            join(queriesDir, 'casos/get-inactive-cases.sql'),
            'utf-8'
        );

        // Coordinadores
        const getCoordinatorsSql = readFileSync(
            join(queriesDir, 'usuarios/get-all-coordinators.sql'),
            'utf-8'
        );

        // Notificaciones
        const createNotificationSql = readFileSync(
            join(queriesDir, 'notificaciones/create.sql'),
            'utf-8'
        );

        const existsUnreadSql = readFileSync(
            join(queriesDir, 'notificaciones/exists-unread.sql'),
            'utf-8'
        );

        // Profesores Supervisores
        const getProfSupervisoresSql = readFileSync(
            join(queriesDir, 'casos/get-profesors-sup.sql'),
            'utf-8'
        );

        // 2. Obtener Coordinadores
        const coordsResult = await pool.query(getCoordinatorsSql);
        const coordinadores = coordsResult.rows;

        if (coordinadores.length === 0) {

            return { success: false, message: 'No active coordinators found' };
        }

        // Sender ID: Usamos el primer coordinador o un ID sistema si existiera.
        const senderId = coordinadores[0].cedula;

        // 3. Buscar Casos Inactivos
        const inactiveResult = await pool.query(getInactiveCasesSql);
        const inactiveCases = inactiveResult.rows;

        if (inactiveCases.length === 0) {
            return { success: true, count: 0, message: 'No inactive cases found.' };
        }

        // 4. Recopilar profesores supervisores únicos de todos los casos inactivos
        const profesoresSet = new Set<string>();
        for (const caso of inactiveCases) {
            try {
                const profResult = await pool.query(getProfSupervisoresSql, [caso.id_caso]);
                for (const row of profResult.rows) {
                    const cedula = row.cedula_profesor || row.cedula_usuario;
                    if (cedula) {
                        profesoresSet.add(cedula);
                    }
                }
            } catch (err) {
                // Ignorar errores individuales
            }
        }

        // 5. Crear lista unificada de destinatarios (coordinadores + profesores)
        const destinatarios = new Set<string>();
        for (const coord of coordinadores) {
            destinatarios.add(coord.cedula);
        }
        for (const prof of profesoresSet) {
            destinatarios.add(prof);
        }

        // 6. Notificar con el mismo mensaje a todos
        const cantidadInactivos = inactiveCases.length;
        const titulo = "Casos inactivos";
        const listaCasos = cantidadInactivos === 1
            ? `#${inactiveCases[0].id_caso}`
            : inactiveCases.map((c: any) => `#${c.id_caso}`).join(', ');
        const mensaje = `Se han detectado ${cantidadInactivos} ${cantidadInactivos === 1 ? 'caso inactivo' : 'casos inactivos'} (${listaCasos}) sin actividad en los últimos 2 semestres. Haz clic aquí para gestionar.`;

        let notificationsSent = 0;

        for (const cedulaDestinatario of destinatarios) {
            try {
                // Verificar si ya tiene notificación pendiente con el mismo título y mensaje
                const existeResultado = await pool.query(existsUnreadSql, [cedulaDestinatario, titulo, mensaje]);
                if (existeResultado.rowCount && existeResultado.rowCount > 0) {
                    continue;
                }

                await pool.query(createNotificationSql, [
                    cedulaDestinatario,
                    senderId,
                    titulo,
                    mensaje
                ]);
                notificationsSent++;
            } catch (notifError) {
                // Ignorar errores individuales de notificación
            }
        }

        return {
            success: true,
            inactiveCount: cantidadInactivos,
            notificationsSent
        };

    } catch (error) {
        logger.error('Error en checkAndNotifyInactiveCases:', error);
        return { success: false, error };
    }
}
