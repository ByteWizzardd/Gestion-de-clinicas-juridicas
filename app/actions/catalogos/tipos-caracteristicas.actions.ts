'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllTiposCaracteristicas } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getTiposCaracteristicas() {
    try {
        const tipos = await getAllTiposCaracteristicas();
        return { success: true, data: tipos };
    } catch (error) {
        logger.error('Error getting tipos de caracteristicas:', error);
        return { success: false, error: 'Error al obtener tipos de características' };
    }
}

export async function createTipoCaracteristica(data: { nombre_tipo_caracteristica: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Tipos de Características' },
        async (client) => {
            // Obtenemos el siguiente ID manualmente por si no es autoincremental
            const maxResult = await client.query('SELECT COALESCE(MAX(id_tipo), 0) + 1 as next_id FROM tipo_caracteristicas');
            const nextId = maxResult.rows[0].next_id;

            const result = await client.query(
                'INSERT INTO tipo_caracteristicas (id_tipo, nombre_tipo_caracteristica, habilitado) VALUES ($1, $2, true) RETURNING *',
                [nextId, data.nombre_tipo_caracteristica]
            );

            revalidatePath('/dashboard/administration/tipos-caracteristicas');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating tipo caracteristica:', error);
        return { success: false, error: 'Error al crear tipo de característica' };
    });
}

export async function updateTipoCaracteristica(id: number, data: { nombre_tipo_caracteristica: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Tipos de Características' },
        async (client) => {
            const result = await client.query(
                'UPDATE tipo_caracteristicas SET nombre_tipo_caracteristica = $2 WHERE id_tipo = $1 RETURNING *',
                [id, data.nombre_tipo_caracteristica]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/tipos-caracteristicas');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating tipo caracteristica:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Tipo no encontrado' };
        return { success: false, error: 'Error al actualizar tipo' };
    });
}

export async function toggleTipoCaracteristicaHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Tipos de Características' },
        async (client) => {
            const result = await client.query(
                'UPDATE tipo_caracteristicas SET habilitado = NOT habilitado WHERE id_tipo = $1 RETURNING *',
                [id]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/tipos-caracteristicas');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling tipo caracteristica habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Tipo no encontrado' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteTipoCaracteristica(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM caracteristicas WHERE id_tipo_caracteristica = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene características asociadas.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Tipos de Características', motivo: motivo || '' },
        async (client) => {
            const result = await client.query('DELETE FROM tipo_caracteristicas WHERE id_tipo = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/tipos-caracteristicas');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting tipo caracteristica:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Tipo no encontrado' };
        return { success: false, error: 'Error al eliminar tipo' };
    });
}
