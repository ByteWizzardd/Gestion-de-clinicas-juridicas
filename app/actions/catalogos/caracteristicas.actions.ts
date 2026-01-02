'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCaracteristicas } from '@/lib/db/queries/catalogos.queries';

export async function getCaracteristicas() {
    try {
        const caracteristicas = await getAllCaracteristicas();
        return { success: true, data: caracteristicas };
    } catch (error) {
        console.error('Error getting caracteristicas:', error);
        return { success: false, error: 'Error al obtener características' };
    }
}

export async function createCaracteristica(data: { id_tipo_caracteristica: string; descripcion: string }) {
    try {
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_caracteristica), 0) + 1 as next_num FROM caracteristicas WHERE id_tipo_caracteristica = $1',
            [parseInt(data.id_tipo_caracteristica)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, true) RETURNING *',
            [parseInt(data.id_tipo_caracteristica), nextNum, data.descripcion]
        );
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating caracteristica:', error);
        return { success: false, error: 'Error al crear característica' };
    }
}

export async function updateCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number, data: { descripcion: string }) {
    try {
        const result = await pool.query(
            'UPDATE caracteristicas SET descripcion = $3 WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica, data.descripcion]
        );
        if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar característica' };
    }
}

export async function toggleCaracteristicaHabilitado(id_tipo_caracteristica: number, num_caracteristica: number) {
    try {
        const result = await pool.query(
            'UPDATE caracteristicas SET habilitado = NOT habilitado WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM caracteristicas_vivienda WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2
            ) AS has_associations`,
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque está asociada a viviendas de clientes.'
            };
        }
        const result = await pool.query(
            'DELETE FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar característica' };
    }
}
