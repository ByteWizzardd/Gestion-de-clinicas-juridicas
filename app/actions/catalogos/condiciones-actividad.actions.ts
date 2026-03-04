'use server';

import { pool } from '@/lib/db/pool';
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'INSERT INTO condicion_actividad (nombre_actividad) VALUES ($1) RETURNING *',
            [data.nombre_actividad]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating condicion actividad:', error);
        return { success: false, error: 'Error al crear condición de actividad' };
    } finally {
        client.release();
    }
}

export async function updateCondicionActividad(id: number, data: { nombre_actividad: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE condicion_actividad SET nombre_actividad = $2 WHERE id_actividad = $1 RETURNING *',
            [id, data.nombre_actividad]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error updating condicion actividad:', error);
        return { success: false, error: 'Error al actualizar condición' };
    } finally {
        client.release();
    }
}

export async function toggleCondicionActividadHabilitado(id: number) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE condicion_actividad SET habilitado = NOT habilitado WHERE id_actividad = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error toggling condicion actividad habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteCondicionActividad(id: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM solicitantes WHERE id_actividad = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene solicitantes asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query('DELETE FROM condicion_actividad WHERE id_actividad = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error deleting condicion actividad:', error);
        return { success: false, error: 'Error al eliminar condición' };
    } finally {
        client.release();
    }
}
