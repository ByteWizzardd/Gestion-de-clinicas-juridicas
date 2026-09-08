'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllMaterias } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

/**
 * Get all materias
 */
export async function getMaterias() {
    try {
        const materias = await getAllMaterias();
        return { success: true, data: materias };
    } catch (error) {
        logger.error('Error getting materias:', error);
        return { success: false, error: 'Error al obtener materias' };
    }
}

/**
 * Create a new materia
 */
export async function createMateria(data: { nombre_materia: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Materias' },
        async (client) => {
            const result = await client.query(
                'INSERT INTO materias (nombre_materia) VALUES ($1) RETURNING *',
                [data.nombre_materia]
            );
            revalidatePath('/dashboard/administration/materias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('❌ Error creating materia:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear materia: ${errorMessage}` };
    });
}

/**
 * Update an existing materia
 */
export async function updateMateria(id: number, data: { nombre_materia: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Materias' },
        async (client) => {
            const result = await client.query(
                'UPDATE materias SET nombre_materia = $2 WHERE id_materia = $1 RETURNING *',
                [id, data.nombre_materia]
            );

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/materias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating materia:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Materia no encontrada' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar materia: ${errorMessage}` };
    });
}

/**
 * Toggle habilitado status for materia
 */
export async function toggleMateriaHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Materias' },
        async (client) => {
            const result = await client.query(
                'UPDATE materias SET habilitado = NOT habilitado WHERE id_materia = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/materias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling materia habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Materia no encontrada' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    });
}

/**
 * Delete a materia (only if no associations)
 */
export async function deleteMateria(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        // Check for associations first
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM categorias WHERE id_materia = $1
                UNION
                SELECT 1 FROM casos WHERE id_materia = $1
            ) AS has_associations`,
            [id]
        );

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar esta materia porque tiene categorías o casos asociados. Deshabilítela en su lugar.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Materias', motivo: motivo || '' },
        async (client) => {
            // No associations, safe to delete
            const result = await client.query(
                'DELETE FROM materias WHERE id_materia = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/materias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting materia:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Materia no encontrada' };
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar materia: ${errorMessage}` };
    });
}
