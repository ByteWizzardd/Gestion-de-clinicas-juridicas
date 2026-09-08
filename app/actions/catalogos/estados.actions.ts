'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllEstados } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

/**
 * Get all estados
 */
export async function getEstados() {
    try {
        const estados = await getAllEstados();
        return { success: true, data: estados };
    } catch (error) {
        logger.error('Error getting estados:', error);
        return { success: false, error: 'Error al obtener estados' };
    }
}

/**
 * Create a new estado
 */
export async function createEstado(data: { nombre_estado: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Estados' },
        async (client) => {
            const result = await client.query(
                'INSERT INTO estados (nombre_estado) VALUES ($1) RETURNING *',
                [data.nombre_estado]
            );

            revalidatePath('/dashboard/administration/estados');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('❌ Error creating estado:', error);
        return { success: false, error: 'Error al crear estado' };
    });
}

/**
 * Update an estado
 */
export async function updateEstado(id: number, data: { nombre_estado: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Estados' },
        async (client) => {
            const result = await client.query(
                'UPDATE estados SET nombre_estado = $2 WHERE id_estado = $1 RETURNING *',
                [id, data.nombre_estado]
            );

            if (result.rows.length === 0) {
                return { success: false, error: 'Estado no encontrado' };
            }

            revalidatePath('/dashboard/administration/estados');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar estado: ${errorMessage}` };
    });
}

/**
 * Toggle habilitado status of an estado
 */
export async function toggleEstadoHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Estados' },
        async (client) => {
            const result = await client.query(
                'UPDATE estados SET habilitado = NOT habilitado WHERE id_estado = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return { success: false, error: 'Estado no encontrado' };
            }

            revalidatePath('/dashboard/administration/estados');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling estado habilitado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    });
}

/**
 * Delete an estado (only if no associations exist)
 */
export async function deleteEstado(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    // Check for associations BEFORE opening the transaction to save connections
    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM municipios WHERE id_estado = $1
                UNION
                SELECT 1 FROM solicitantes WHERE id_estado = $1
            ) AS has_associations`,
            [id]
        );

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este estado porque tiene municipios o solicitantes asociados. Deshabilítelo en su lugar.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Estados', motivo: motivo || '' },
        async (client) => {
            const result = await client.query(
                'DELETE FROM estados WHERE id_estado = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return { success: false, error: 'Estado no encontrado' };
            }

            revalidatePath('/dashboard/administration/estados');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar estado: ${errorMessage}` };
    });
}
