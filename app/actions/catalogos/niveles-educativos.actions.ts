'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllNivelesEducativos } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { readFileSync } from 'fs';
import { join } from 'path';

const QUERIES_DIR = join(process.cwd(), 'database', 'queries', 'catalogos');

function loadQuery(filename: string): string {
    return readFileSync(join(QUERIES_DIR, filename), 'utf-8');
}

/**
 * Get all niveles educativos
 */
export async function getNivelesEducativos() {
    try {
        const nivelesEducativos = await getAllNivelesEducativos();
        return { success: true, data: nivelesEducativos };
    } catch (error) {
        logger.error('Error getting niveles educativos:', error);
        return { success: false, error: 'Error al obtener niveles educativos' };
    }
}

/**
 * Create a new nivel educativo
 */
export async function createNivelEducativo(data: { descripcion: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Niveles Educativos' },
        async (client) => {
            const query = loadQuery('create-nivel-educativo.sql');
            const result = await client.query(query, [data.descripcion]);

            revalidatePath('/dashboard/administration/niveles-educativos');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('❌ Error creating nivel educativo:', error);
        return { success: false, error: 'Error al crear nivel educativo' };
    });
}

/**
 * Update a nivel educativo
 */
export async function updateNivelEducativo(id: number, data: { descripcion: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Niveles Educativos' },
        async (client) => {
            const query = loadQuery('update-nivel-educativo.sql');
            const result = await client.query(query, [id, data.descripcion]);

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/niveles-educativos');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating nivel educativo:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Nivel educativo no encontrado' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar nivel educativo: ${errorMessage}` };
    });
}

/**
 * Toggle habilitado status of a nivel educativo
 */
export async function toggleNivelEducativoHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Niveles Educativos' },
        async (client) => {
            const query = loadQuery('toggle-nivel-educativo-habilitado.sql');
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/niveles-educativos');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling nivel educativo habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Nivel educativo no encontrado' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    });
}

/**
 * Delete a nivel educativo (only if no associations exist)
 */
export async function deleteNivelEducativo(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        // Check for associations
        const checkQuery = loadQuery('check-nivel-educativo-associations.sql');
        const checkResult = await client.query(checkQuery, [id]);

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este nivel educativo porque tiene solicitantes o familias asociadas. Deshabilítelo en su lugar.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Niveles Educativos', motivo: motivo || '' },
        async (client) => {
            // No associations, safe to delete
            const query = loadQuery('delete-nivel-educativo.sql');
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/niveles-educativos');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting nivel educativo:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Nivel educativo no encontrado' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar nivel educativo: ${errorMessage}` };
    });
}
