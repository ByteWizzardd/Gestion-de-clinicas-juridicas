'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesTrabajo } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getCondicionesTrabajo() {
    try {
        const condiciones = await getAllCondicionesTrabajo();
        return { success: true, data: condiciones };
    } catch (error) {
        logger.error('Error getting condiciones de trabajo:', error);
        return { success: false, error: 'Error al obtener condiciones de trabajo' };
    }
}

export async function createCondicionTrabajo(data: { nombre_trabajo: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Condiciones de Trabajo' },
        async (client) => {
            const result = await client.query(
                'INSERT INTO condicion_trabajo (nombre_trabajo) VALUES ($1) RETURNING *',
                [data.nombre_trabajo]
            );

            revalidatePath('/dashboard/administration/condiciones-trabajo');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating condicion trabajo:', error);
        return { success: false, error: 'Error al crear condición de trabajo' };
    });
}

export async function updateCondicionTrabajo(id: number, data: { nombre_trabajo: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Condiciones de Trabajo' },
        async (client) => {
            const result = await client.query(
                'UPDATE condicion_trabajo SET nombre_trabajo = $2 WHERE id_trabajo = $1 RETURNING *',
                [id, data.nombre_trabajo]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-trabajo');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating condicion trabajo:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al actualizar condición' };
    });
}

export async function toggleCondicionTrabajoHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Condiciones de Trabajo' },
        async (client) => {
            const result = await client.query(
                'UPDATE condicion_trabajo SET habilitado = NOT habilitado WHERE id_trabajo = $1 RETURNING *',
                [id]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-trabajo');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling condicion trabajo habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteCondicionTrabajo(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM solicitantes WHERE id_trabajo = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene solicitantes asociados.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Condiciones de Trabajo', motivo: motivo || '' },
        async (client) => {
            const result = await client.query('DELETE FROM condicion_trabajo WHERE id_trabajo = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-trabajo');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting condicion trabajo:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al eliminar condición' };
    });
}
