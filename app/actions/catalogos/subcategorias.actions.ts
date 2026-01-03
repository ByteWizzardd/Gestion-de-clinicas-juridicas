'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllSubcategorias } from '@/lib/db/queries/catalogos.queries';

export async function getSubcategorias() {
    try {
        const subcategorias = await getAllSubcategorias();
        return { success: true, data: subcategorias };
    } catch (error) {
        console.error('Error getting subcategorias:', error);
        return { success: false, error: 'Error al obtener subcategorías' };
    }
}

export async function createSubcategoria(data: { id_materia: string; num_categoria: string; nombre_subcategoria: string }) {
    try {
        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);

        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_subcategoria), 0) + 1 as next_num FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
            [id_materia, num_categoria]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_materia, num_categoria, nextNum, data.nombre_subcategoria]
        );
        revalidatePath('/dashboard/catalogs/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating subcategoria:', error);
        return { success: false, error: 'Error al crear subcategoría' };
    }
}

export async function updateSubcategoria(id_materia: number, num_categoria: number, num_subcategoria: number, data: { nombre_subcategoria: string }) {
    try {
        const result = await pool.query(
            'UPDATE subcategorias SET nombre_subcategoria = $4 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, data.nombre_subcategoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Subcategoría no encontrada' };
        revalidatePath('/dashboard/catalogs/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar subcategoría' };
    }
}

export async function toggleSubcategoriaHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number) {
    try {
        const result = await pool.query(
            'UPDATE subcategorias SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
            [id_materia, num_categoria, num_subcategoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Subcategoría no encontrada' };
        revalidatePath('/dashboard/catalogs/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteSubcategoria(id_materia: number, num_categoria: number, num_subcategoria: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3
            ) AS has_associations`,
            [id_materia, num_categoria, num_subcategoria]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene ámbitos legales asociados.'
            };
        }
        const result = await pool.query(
            'DELETE FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
            [id_materia, num_categoria, num_subcategoria]
        );
        if (result.rows.length === 0) return { success: false, error: 'Subcategoría no encontrada' };
        revalidatePath('/dashboard/catalogs/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar subcategoría' };
    }
}
