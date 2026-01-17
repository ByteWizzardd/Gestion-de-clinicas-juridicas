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

    // Rate Limiting simple usando Cookies
    // Verificar si ya se corrió hoy para este usuario (browser session)
    const cookieStore = await cookies();
    const lastCheck = cookieStore.get('last_inactive_check');
    const today = new Date().toISOString().split('T')[0];

    if (lastCheck && lastCheck.value === today) {
        return { success: true, message: 'Already checked today' };
    }

    // Ejecutar verificación
    const result = await checkAndNotifyInactiveCases();

    // Marcar como chequeado hoy
    if (result.success) {
        cookieStore.set('last_inactive_check', today, {
            maxAge: 60 * 60 * 24, // 24 horas
            path: '/',
            httpOnly: true
        });
    }

    return result;
}
