'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllParroquias } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getParroquias() {
    try {
        const parroquias = await getAllParroquias();
        return { success: true, data: parroquias };
    } catch (error) {
        console.error('Error getting parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

export async function createParroquia(data: { id_estado: string; id_municipio: string; nombre_parroquia: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const id_estado = parseInt(data.id_estado);
        const num_municipio = parseInt(data.id_municipio);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
            [id_estado, num_municipio]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await client.query(
            'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, nextNum, data.nombre_parroquia]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating parroquia:', error);
        return { success: false, error: 'Error al crear parroquia' };
    } finally {
        client.release();
    }
}

export async function updateParroquia(id_estado: number, num_municipio: number, num_parroquia: number, data: { 
    nombre_parroquia?: string;
    id_estado?: string;
    id_municipio?: string;
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        // Construir la query dinámicamente basada en los campos proporcionados
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (data.nombre_parroquia !== undefined) {
            updates.push(`nombre_parroquia = $${paramIndex++}`);
            values.push(data.nombre_parroquia);
        }
        if (data.id_estado !== undefined) {
            updates.push(`id_estado = $${paramIndex++}`);
            values.push(parseInt(data.id_estado));
        }
        if (data.id_municipio !== undefined) {
            updates.push(`num_municipio = $${paramIndex++}`);
            values.push(parseInt(data.id_municipio));
        }

        if (updates.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No se proporcionaron campos para actualizar' };
        }

        // Usar los valores antiguos para encontrar la parroquia
        values.push(id_estado, num_municipio, num_parroquia);
        const query = `UPDATE parroquias SET ${updates.join(', ')} WHERE id_estado = $${paramIndex} AND num_municipio = $${paramIndex + 1} AND num_parroquia = $${paramIndex + 2} RETURNING *`;
        
        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Parroquia no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating parroquia:', error);
        return { success: false, error: 'Error al actualizar parroquia' };
    } finally {
        client.release();
    }
}

export async function toggleParroquiaHabilitado(id_estado: number, num_municipio: number, num_parroquia: number) {
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
            'UPDATE parroquias SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Parroquia no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling parroquia habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteParroquia(id_estado: number, num_municipio: number, num_parroquia: number, motivo?: string) {
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
                SELECT 1 FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
                UNION
                SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
            ) AS has_associations`,
            [id_estado, num_municipio, num_parroquia]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene núcleos o solicitantes asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM parroquias WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Parroquia no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting parroquia:', error);
        return { success: false, error: 'Error al eliminar parroquia' };
    } finally {
        client.release();
    }
}
