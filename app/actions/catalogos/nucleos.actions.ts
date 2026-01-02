'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllNucleos } from '@/lib/db/queries/catalogos.queries';

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

        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_nucleo), 0) + 1 as next_num FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3',
            [id_estado, num_municipio, num_parroquia]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO nucleos (id_estado, num_municipio, num_parroquia, num_nucleo, nombre_nucleo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_estado, num_municipio, num_parroquia, nextNum, data.nombre_nucleo]
        );
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating nucleo:', error);
        return { success: false, error: 'Error al crear núcleo' };
    }
}

export async function updateNucleo(id_estado: number, num_municipio: number, num_parroquia: number, num_nucleo: number, data: { nombre_nucleo: string }) {
    try {
        const result = await pool.query(
            'UPDATE nucleos SET nombre_nucleo = $5 WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 AND num_nucleo = $4 RETURNING *',
            [id_estado, num_municipio, num_parroquia, num_nucleo, data.nombre_nucleo]
        );
        if (result.rows.length === 0) return { success: false, error: 'Núcleo no encontrado' };
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar núcleo' };
    }
}

export async function toggleNucleoHabilitado(id_estado: number, num_municipio: number, num_parroquia: number, num_nucleo: number) {
    try {
        const result = await pool.query(
            'UPDATE nucleos SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 AND num_nucleo = $4 RETURNING *',
            [id_estado, num_municipio, num_parroquia, num_nucleo]
        );
        if (result.rows.length === 0) return { success: false, error: 'Núcleo no encontrado' };
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteNucleo(id_estado: number, num_municipio: number, num_parroquia: number, num_nucleo: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM casos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 AND num_nucleo = $4
            ) AS has_associations`,
            [id_estado, num_municipio, num_parroquia, num_nucleo]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene casos asociados.'
            };
        }
        const result = await pool.query(
            'DELETE FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 AND num_nucleo = $4 RETURNING *',
            [id_estado, num_municipio, num_parroquia, num_nucleo]
        );
        if (result.rows.length === 0) return { success: false, error: 'Núcleo no encontrado' };
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar núcleo' };
    }
}
