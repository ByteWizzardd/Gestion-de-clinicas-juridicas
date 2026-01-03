'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllParroquias } from '@/lib/db/queries/catalogos.queries';

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
    try {
        const id_estado = parseInt(data.id_estado);
        const num_municipio = parseInt(data.id_municipio);

        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
            [id_estado, num_municipio]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, nextNum, data.nombre_parroquia]
        );
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating parroquia:', error);
        return { success: false, error: 'Error al crear parroquia' };
    }
}

export async function updateParroquia(id_estado: number, num_municipio: number, num_parroquia: number, data: { nombre_parroquia: string }) {
    try {
        const result = await pool.query(
            'UPDATE parroquias SET nombre_parroquia = $4 WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia, data.nombre_parroquia]
        );
        if (result.rows.length === 0) return { success: false, error: 'Parroquia no encontrada' };
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar parroquia' };
    }
}

export async function toggleParroquiaHabilitado(id_estado: number, num_municipio: number, num_parroquia: number) {
    try {
        const result = await pool.query(
            'UPDATE parroquias SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) return { success: false, error: 'Parroquia no encontrada' };
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteParroquia(id_estado: number, num_municipio: number, num_parroquia: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
                UNION
                SELECT 1 FROM clientes WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
            ) AS has_associations`,
            [id_estado, num_municipio, num_parroquia]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene núcleos o clientes asociados.'
            };
        }
        const result = await pool.query(
            'DELETE FROM parroquias WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) return { success: false, error: 'Parroquia no encontrada' };
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar parroquia' };
    }
}
