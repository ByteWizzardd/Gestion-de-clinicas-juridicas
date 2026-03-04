'use server';

import { pool } from '@/lib/db/pool';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllNucleos } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getNucleos() {
    try {
        const nucleos = await getAllNucleos();
        return { success: true, data: nucleos };
    } catch (error) {
        logger.error('Error getting nucleos:', error);
        return { success: false, error: 'Error al obtener núcleos' };
    }
}

export async function createNucleo(data: { id_estado: string; id_municipio: string; id_parroquia: string; nombre_nucleo: string }) {
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
        const num_parroquia = parseInt(data.id_parroquia);

        const result = await client.query(
            'INSERT INTO nucleos (id_estado, num_municipio, num_parroquia, nombre_nucleo) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, num_parroquia, data.nombre_nucleo]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating nucleo:', error);
        return { success: false, error: 'Error al crear núcleo' };
    } finally {
        client.release();
    }
}

export async function updateNucleo(id_nucleo: number, data: {
    nombre_nucleo?: string;
    id_estado?: string;
    id_municipio?: string;
    id_parroquia?: string;
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

        if (data.nombre_nucleo !== undefined) {
            updates.push(`nombre_nucleo = $${paramIndex++}`);
            values.push(data.nombre_nucleo);
        }
        if (data.id_estado !== undefined) {
            updates.push(`id_estado = $${paramIndex++}`);
            values.push(parseInt(data.id_estado));
        }
        if (data.id_municipio !== undefined) {
            updates.push(`num_municipio = $${paramIndex++}`);
            values.push(parseInt(data.id_municipio));
        }
        if (data.id_parroquia !== undefined) {
            updates.push(`num_parroquia = $${paramIndex++}`);
            values.push(parseInt(data.id_parroquia));
        }

        if (updates.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No se proporcionaron campos para actualizar' };
        }

        values.push(id_nucleo);
        const query = `UPDATE nucleos SET ${updates.join(', ')} WHERE id_nucleo = $${paramIndex} RETURNING *`;

        const result = await client.query(query, values);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Núcleo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error updating nucleo:', error);
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
        revalidatePath('/dashboard/administration/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error in toggleNucleoHabilitado:', error);
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
        revalidatePath('/dashboard/administration/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error deleting nucleo:', error);
        return { success: false, error: 'Error al eliminar núcleo' };
    } finally {
        client.release();
    }
}
