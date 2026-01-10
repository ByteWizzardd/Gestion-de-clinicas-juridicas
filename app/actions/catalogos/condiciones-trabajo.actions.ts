'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesTrabajo } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getCondicionesTrabajo() {
    try {
        const condiciones = await getAllCondicionesTrabajo();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de trabajo:', error);
        return { success: false, error: 'Error al obtener condiciones de trabajo' };
    }
}

export async function createCondicionTrabajo(data: { nombre_trabajo: string }) {
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
            'INSERT INTO condicion_trabajo (nombre_trabajo) VALUES ($1) RETURNING *',
            [data.nombre_trabajo]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating condicion trabajo:', error);
        return { success: false, error: 'Error al crear condición de trabajo' };
    } finally {
        client.release();
    }
}

export async function updateCondicionTrabajo(id: number, data: { nombre_trabajo: string }) {
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
            'UPDATE condicion_trabajo SET nombre_trabajo = $2 WHERE id_trabajo = $1 RETURNING *',
            [id, data.nombre_trabajo]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating condicion trabajo:', error);
        return { success: false, error: 'Error al actualizar condición' };
    } finally {
        client.release();
    }
}

export async function toggleCondicionTrabajoHabilitado(id: number) {
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
            'UPDATE condicion_trabajo SET habilitado = NOT habilitado WHERE id_trabajo = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling condicion trabajo habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteCondicionTrabajo(id: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM solicitantes WHERE id_trabajo = $1) AS has_associations`,
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

        const result = await client.query('DELETE FROM condicion_trabajo WHERE id_trabajo = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Condición no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting condicion trabajo:', error);
        return { success: false, error: 'Error al eliminar condición' };
    } finally {
        client.release();
    }
}
