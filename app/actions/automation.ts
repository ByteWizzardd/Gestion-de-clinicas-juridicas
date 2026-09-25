'use server';

import { checkAndNotifyInactiveCases } from '@/lib/services/inactive-cases.service';
import { checkAndNotifyAuditRetention } from '@/lib/services/audit-retention.service';
import { requireAuthInServerAction } from '@/lib/utils/server-auth';

/**
 * Segundos que lleva abierta la sesión, a partir del `iat` del token.
 *
 * Si el token no trae `iat` —no debería pasar, pero es opcional en el tipo— se
 * devuelve un día: con eso el aviso no se duplica en el uso normal, que es el
 * error que más molesta de los dos posibles.
 */
function segundosDeSesion(inicioEnSegundosUnix?: number): number {
    if (!inicioEnSegundosUnix) return 86400;
    return Math.max(0, Math.floor(Date.now() / 1000) - inicioEnSegundosUnix);
}

/**
 * Trigger manual o automático para verificar casos inactivos.
 * Se recomienda llamar a esto en el Dashboard principal.
 */
export async function triggerInactiveCasesCheckAction() {
    const auth = await requireAuthInServerAction();
    if (!auth.success || !auth.user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Opcional: Solo coordinadores pueden gatillar esto
    if (auth.user.rol !== 'Coordinador') {
        return { success: false, message: 'Skipped: User is not coordinator' };
    }

    // El servicio evita duplicados por sí mismo: no crea una notificación
    // igual a una que el destinatario todavía no ha eliminado.
    return await checkAndNotifyInactiveCases();
}

/**
 * Chequeo de retención de la auditoría: avisa al Coordinador cuando hay
 * registros que ya cumplieron su plazo. Solo NOTIFICA — la purga la confirma
 * él a mano desde /dashboard/audit?purgeLogs=true.
 */
export async function triggerAuditRetentionCheckAction() {
    const auth = await requireAuthInServerAction();
    if (!auth.success || !auth.user) {
        return { success: false, error: 'Unauthorized' };
    }

    if (auth.user.rol !== 'Coordinador') {
        return { success: false, message: 'Skipped: User is not coordinator' };
    }

    return await checkAndNotifyAuditRetention(segundosDeSesion(auth.user.sesionIniciadaEn));
}
