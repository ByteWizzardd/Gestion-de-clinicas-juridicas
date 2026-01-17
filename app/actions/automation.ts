'use server';

import { checkAndNotifyInactiveCases } from '@/lib/services/inactive-cases.service';
import { requireAuthInServerAction } from '@/lib/utils/server-auth';
import { cookies } from 'next/headers';

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

    // Rate Limiting removido a petición del usuario para notificar en cada inicio de sesión
    // La duplicidad de notificaciones se maneja en el servicio (notificaciones no leídas)

    // Ejecutar verificación
    const result = await checkAndNotifyInactiveCases();

    return result;
}
