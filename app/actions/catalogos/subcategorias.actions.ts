'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllSubcategorias } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all subcategorias
 */
export async function getSubcategorias() {
    try {
        const subcategorias = await getAllSubcategorias();
        return { success: true, data: subcategorias };
    } catch (error) {
        console.error('Error getting subcategorias:', error);
        return { success: false, error: 'Error al obtener subcategorías' };
    }
}

/**
 * Create a new subcategoria
 */
export async function createSubcategoria(data: { id_materia: string; num_categoria: string; nombre_subcategoria: string }) {
    try {
        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);

        // Get next num_subcategoria
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
