'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllMunicipios } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getMunicipios() {
    try {
        const municipios = await getAllMunicipios();
        return { success: true, data: municipios };
    } catch (error) {
        console.error('Error getting municipios:', error);
        return { success: false, error: 'Error al obtener municipios' };
    }
}

export async function createMunicipio(data: { id_estado: string; nombre_municipio: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
            [parseInt(data.id_estado)]
        );
        const nextNum = maxResult.rows[0].next_num;
        const result = await client.query(
            'INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(data.id_estado), nextNum, data.nombre_municipio]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating municipio:', error);
        return { success: false, error: 'Error al crear municipio' };
    } finally {
        client.release();
    }
}

export async function updateMunicipio(id_estado: number, num_municipio: number, data: { nombre_municipio: string, id_estado?: number }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        let result;
        // Check if we are moving the municipality to a different state
        if (data.id_estado && data.id_estado !== id_estado) {
            const maxResult = await client.query(
                'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
                [data.id_estado]
            );
            const nextNum = maxResult.rows[0].next_num;

            result = await client.query(
                'UPDATE municipios SET nombre_municipio = $3, id_estado = $4, num_municipio = $5 WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
                [id_estado, num_municipio, data.nombre_municipio, data.id_estado, nextNum]
            );
        } else {
            // Standard update (just name)
            result = await client.query(
                'UPDATE municipios SET nombre_municipio = $3 WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
                [id_estado, num_municipio, data.nombre_municipio]
            );
        }

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Municipio no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error updating municipio:', error);
        // Handle FK violations gracefully if possible, or just return the error
        if (error.code === '23503') { // ForeignKeyViolation
            return { success: false, error: 'No se puede mover el municipio porque tiene registros asociados y la base de datos no soporta actualización en cascada.' };
        }
        return { success: false, error: 'Error al actualizar municipio: ' + error.message };
    } finally {
        client.release();
    }
}

export async function toggleMunicipioHabilitado(id_estado: number, num_municipio: number) {
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
            'UPDATE municipios SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
            [id_estado, num_municipio]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Municipio no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling municipio habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteMunicipio(id_estado: number, num_municipio: number, motivo?: string) {
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
                SELECT 1 FROM parroquias WHERE id_estado = $1 AND num_municipio = $2
                UNION
                SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2
            ) AS has_associations`,
            [id_estado, num_municipio]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene parroquias o solicitantes asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM municipios WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
            [id_estado, num_municipio]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Municipio no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting municipio:', error);
        return { success: false, error: 'Error al eliminar municipio' };
    } finally {
        client.release();
    }
}
