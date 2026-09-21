'use server';

import { getAllCatalogCounts } from '@/lib/db/queries/catalogos.queries';
import { logger } from '@/lib/utils/logger';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

/**
 * Get counts for all catalog types
 */
export async function getCatalogCounts() {
    try {
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            return { success: false, error: 'No autorizado' };
        }

        const counts = await getAllCatalogCounts();
        return { success: true, data: counts };
    } catch (error) {
        logger.error('Error getting catalog counts:', error);
        return { success: false, error: 'Error al obtener conteos de catálogos' };
    }
}
