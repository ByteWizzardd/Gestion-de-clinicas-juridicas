'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesActividad } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getCondicionesActividad() {
    try {
        const condiciones = await getAllCondicionesActividad();
        return { success: true, data: condiciones };
    } catch (error) {
        logger.error('Error getting condiciones de actividad:', error);
        return { success: false, error: 'Error al obtener condiciones de actividad' };
    }
}

export async function createCondicionActividad(data: { nombre_actividad: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Condiciones de Actividad' },
        async (client) => {
            const result = await client.query(
                'INSERT INTO condicion_actividad (nombre_actividad) VALUES ($1) RETURNING *',
                [data.nombre_actividad]
            );

            revalidatePath('/dashboard/administration/condiciones-actividad');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating condicion actividad:', error);
        return { success: false, error: 'Error al crear condición de actividad' };
    });
}

export async function updateCondicionActividad(id: number, data: { nombre_actividad: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Condiciones de Actividad' },
        async (client) => {
            const result = await client.query(
                'UPDATE condicion_actividad SET nombre_actividad = $2 WHERE id_actividad = $1 RETURNING *',
                [id, data.nombre_actividad]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-actividad');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error updating condicion actividad:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al actualizar condición' };
    });
}

export async function toggleCondicionActividadHabilitado(id: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Condiciones de Actividad' },
        async (client) => {
            const result = await client.query(
                'UPDATE condicion_actividad SET habilitado = NOT habilitado WHERE id_actividad = $1 RETURNING *',
                [id]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-actividad');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling condicion actividad habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteCondicionActividad(id: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM solicitantes WHERE id_actividad = $1) AS has_associations`,
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
        { accion_negocio: 'Eliminación en catálogo Condiciones de Actividad', motivo: motivo || '' },
        async (client) => {
            const result = await client.query('DELETE FROM condicion_actividad WHERE id_actividad = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/condiciones-actividad');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting condicion actividad:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Condición no encontrada' };
        return { success: false, error: 'Error al eliminar condición' };
    });
}
