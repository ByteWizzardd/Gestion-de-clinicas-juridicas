'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllTiposCaracteristicas } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getTiposCaracteristicas() {
    try {
        const tipos = await getAllTiposCaracteristicas();
        return { success: true, data: tipos };
    } catch (error) {
        console.error('Error getting tipos de caracteristicas:', error);
        return { success: false, error: 'Error al obtener tipos de características' };
    }
}

export async function createTipoCaracteristica(data: { nombre_tipo_caracteristica: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        // Obtenemos el siguiente ID manualmente por si no es autoincremental
        const maxResult = await client.query('SELECT COALESCE(MAX(id_tipo), 0) + 1 as next_id FROM tipo_caracteristicas');
        const nextId = maxResult.rows[0].next_id;

        const result = await client.query(
            'INSERT INTO tipo_caracteristicas (id_tipo, nombre_tipo_caracteristica, habilitado) VALUES ($1, $2, true) RETURNING *',
            [nextId, data.nombre_tipo_caracteristica]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating tipo caracteristica:', error);
        return { success: false, error: 'Error al crear tipo de característica' };
    } finally {
        client.release();
    }
}

export async function updateTipoCaracteristica(id: number, data: { nombre_tipo_caracteristica: string }) {
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
            'UPDATE tipo_caracteristicas SET nombre_tipo_caracteristica = $2 WHERE id_tipo = $1 RETURNING *',
            [id, data.nombre_tipo_caracteristica]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Tipo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating tipo caracteristica:', error);
        return { success: false, error: 'Error al actualizar tipo' };
    } finally {
        client.release();
    }
}

export async function toggleTipoCaracteristicaHabilitado(id: number) {
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
            'UPDATE tipo_caracteristicas SET habilitado = NOT habilitado WHERE id_tipo = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Tipo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling tipo caracteristica habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteTipoCaracteristica(id: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (SELECT 1 FROM caracteristicas WHERE id_tipo_caracteristica = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene características asociadas.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query('DELETE FROM tipo_caracteristicas WHERE id_tipo = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Tipo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting tipo caracteristica:', error);
        return { success: false, error: 'Error al eliminar tipo' };
    } finally {
        client.release();
    }
}
