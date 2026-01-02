'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCategorias } from '@/lib/db/queries/catalogos.queries';

export async function getCategorias() {
    try {
        const categorias = await getAllCategorias();
        return { success: true, data: categorias };
    } catch (error) {
        console.error('Error getting categorias:', error);
        return { success: false, error: `Error al obtener categorías: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function createCategoria(data: { id_materia: string; nombre_categoria: string }) {
    try {
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_categoria), 0) + 1 as next_num FROM categorias WHERE id_materia = $1',
            [parseInt(data.id_materia)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO categorias (id_materia, num_categoria, nombre_categoria) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(data.id_materia), nextNum, data.nombre_categoria]
        );
        revalidatePath('/dashboard/catalogs/categorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating categoria:', error);
        return { success: false, error: 'Error al crear categoría' };
    }
}

export async function updateCategoria(id_materia: number, num_categoria: number, data: { nombre_categoria: string }) {
    try {
        const result = await pool.query(
            'UPDATE categorias SET nombre_categoria = $3 WHERE id_materia = $1 AND num_categoria = $2 RETURNING *',
            [id_materia, num_categoria, data.nombre_categoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Categoría no encontrada' };
        revalidatePath('/dashboard/catalogs/categorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar categoría' };
    }
}

export async function toggleCategoriaHabilitado(id_materia: number, num_categoria: number) {
    try {
        const result = await pool.query(
            'UPDATE categorias SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 RETURNING *',
            [id_materia, num_categoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Categoría no encontrada' };
        revalidatePath('/dashboard/catalogs/categorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteCategoria(id_materia: number, num_categoria: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2
            ) AS has_associations`,
            [id_materia, num_categoria]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene subcategorías asociadas.'
            };
        }
        const result = await pool.query(
            'DELETE FROM categorias WHERE id_materia = $1 AND num_categoria = $2 RETURNING *',
            [id_materia, num_categoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Categoría no encontrada' };
        revalidatePath('/dashboard/catalogs/categorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar categoría' };
    }
}
