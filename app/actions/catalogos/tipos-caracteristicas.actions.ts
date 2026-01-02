'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllTiposCaracteristicas } from '@/lib/db/queries/catalogos.queries';

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
    try {
        const result = await pool.query(
            'INSERT INTO tipo_caracteristicas (nombre_tipo_caracteristica) VALUES ($1) RETURNING *',
            [data.nombre_tipo_caracteristica]
        );
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating tipo caracteristica:', error);
        return { success: false, error: 'Error al crear tipo de característica' };
    }
}

export async function updateTipoCaracteristica(id: number, data: { nombre_tipo_caracteristica: string }) {
    try {
        const result = await pool.query(
            'UPDATE tipo_caracteristicas SET nombre_tipo_caracteristica = $2 WHERE id_tipo_caracteristica = $1 RETURNING *',
            [id, data.nombre_tipo_caracteristica]
        );
        if (result.rows.length === 0) return { success: false, error: 'Tipo no encontrado' };
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar tipo' };
    }
}

export async function toggleTipoCaracteristicaHabilitado(id: number) {
    try {
        const result = await pool.query(
            'UPDATE tipo_caracteristicas SET habilitado = NOT habilitado WHERE id_tipo_caracteristica = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return { success: false, error: 'Tipo no encontrado' };
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteTipoCaracteristica(id: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (SELECT 1 FROM caracteristicas WHERE id_tipo_caracteristica = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene características asociadas.'
            };
        }
        const result = await pool.query('DELETE FROM tipo_caracteristicas WHERE id_tipo_caracteristica = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return { success: false, error: 'Tipo no encontrado' };
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar tipo' };
    }
}
