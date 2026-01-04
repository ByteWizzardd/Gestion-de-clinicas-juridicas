'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllNucleos } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getNucleos() {
    try {
        const nucleos = await getAllNucleos();
        return { success: true, data: nucleos };
    } catch (error) {
        console.error('Error getting nucleos:', error);
        return { success: false, error: 'Error al obtener núcleos' };
    }
}

export async function createNucleo(data: { id_estado: string; id_municipio: string; id_parroquia: string; nombre_nucleo: string }) {
    try {
        const id_estado = parseInt(data.id_estado);
        const num_municipio = parseInt(data.id_municipio);
        const num_parroquia = parseInt(data.id_parroquia);

        // id_nucleo es SERIAL, se genera automáticamente
        const result = await pool.query(
            'INSERT INTO nucleos (id_estado, num_municipio, num_parroquia, nombre_nucleo) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, num_parroquia, data.nombre_nucleo]
        );
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating nucleo:', error);
        return { success: false, error: 'Error al crear núcleo' };
    }
}

export async function updateNucleo(id_nucleo: number, data: { nombre_nucleo: string }) {
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
            'UPDATE nucleos SET nombre_nucleo = $2 WHERE id_nucleo = $1 RETURNING *',
            [id_nucleo, data.nombre_nucleo]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Núcleo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating nucleo:', error);
        return { success: false, error: 'Error al actualizar núcleo' };
    } finally {
        client.release();
    }
}

export async function toggleNucleoHabilitado(id_nucleo: number) {
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
            'UPDATE nucleos SET habilitado = NOT habilitado WHERE id_nucleo = $1 RETURNING *',
            [id_nucleo]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Núcleo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in toggleNucleoHabilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteNucleo(id_nucleo: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM casos WHERE id_nucleo = $1
            ) AS has_associations`,
            [id_nucleo]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene casos asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM nucleos WHERE id_nucleo = $1 RETURNING *',
            [id_nucleo]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Núcleo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting nucleo:', error);
        return { success: false, error: 'Error al eliminar núcleo' };
    } finally {
        client.release();
    }
}
