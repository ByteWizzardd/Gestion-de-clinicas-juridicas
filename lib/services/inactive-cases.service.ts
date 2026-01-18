import { pool } from '@/lib/db/pool';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Servicio para detectar casos inactivos y notificar a los usuarios correspondientes.
 * Se basa en la lógica original de scripts/check-inactive-cases.mjs
 */
export async function checkAndNotifyInactiveCases() {
    try {
        // 1. Cargar Queries
        const queriesDir = join(process.cwd(), 'database/queries');
        console.log('InactiveCasesService: Cargando queries desde', queriesDir);

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
            console.log('No se encontraron coordinadores activos.');
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

        // 4. Notificar a Coordinadores (Resumen)
        const cantidadInactivos = inactiveCases.length;
        const titulo = "Casos inactivos";
        const casosTexto = cantidadInactivos === 1
            ? `El caso es: ${inactiveCases[0].id_caso}`
            : `Los casos son: ${inactiveCases.map((c: any) => c.id_caso).join(', ')}`;
        const mensaje = `Actualmente hay ${cantidadInactivos} ${cantidadInactivos === 1 ? 'caso inactivo' : 'casos inactivos'} de los 2 últimos semestres. ${casosTexto}.`;

        let activeNotificationsSent = 0;

        for (const coord of coordinadores) {
            try {
                // Verificar si ya tiene notificación pendiente con el mismo título
                const existeResultado = await pool.query(existsUnreadSql, [coord.cedula, titulo]);
                if (existeResultado.rowCount && existeResultado.rowCount > 0) {
                    continue;
                }

                await pool.query(createNotificationSql, [
                    coord.cedula,
                    senderId,
                    titulo,
                    mensaje
                ]);
                activeNotificationsSent++;
            } catch (notifError) {
                console.error(`Error enviando notificación a ${coord.cedula}:`, notifError);
            }
        }

        // 5. Notificar a Profesores Supervisores (Individual)
        let profNotificationsSent = 0;
        for (const caso of inactiveCases) {
            try {
                const profResult = await pool.query(getProfSupervisoresSql, [caso.id_caso]);
                // Adaptar según lo que devuelva el query. El script original mapeaba cedula_profesor O cedula_usuario
                const profesores = profResult.rows.map((r: any) => r.cedula_profesor || r.cedula_usuario).filter(Boolean);

                for (const cedulaProfesor of profesores) {
                    const tituloProf = `Alerta: Caso inactivo asignado #${caso.id_caso}`;
                    const mensajeProf = `El caso #${caso.id_caso} ("${caso.tramite}") que supervisa no ha tenido actividad en los últimos 2 semestres. Última actividad: ${new Date(caso.fecha_ultima_actividad).toLocaleDateString()}`;

                    const existeProf = await pool.query(existsUnreadSql, [cedulaProfesor, tituloProf]);
                    if (existeProf.rowCount && existeProf.rowCount > 0) {
                        continue;
                    }

                    await pool.query(createNotificationSql, [
                        cedulaProfesor,
                        senderId,
                        tituloProf,
                        mensajeProf
                    ]);
                    profNotificationsSent++;
                }
            } catch (err) {
                console.error(`Error procesando profesores para caso ${caso.id_caso}`, err);
            }
        }

        return {
            success: true,
            inactiveCount: cantidadInactivos,
            notificationsSent: {
                coordinators: activeNotificationsSent,
                professors: profNotificationsSent
            }
        };

    } catch (error) {
        console.error('Error en checkAndNotifyInactiveCases:', error);
        return { success: false, error };
    }
}
