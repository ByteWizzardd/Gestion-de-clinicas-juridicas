'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCategorias } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all categorias
 */
export async function getCategorias() {
    try {
        const categorias = await getAllCategorias();
        return { success: true, data: categorias };
    } catch (error) {
        console.error('Error getting categorias:', error);
        return { success: false, error: `Error al obtener categorías: ${error instanceof Error ? error.message : String(error)}` };
    }
}

/**
 * Create a new categoria
 */
export async function createCategoria(data: { id_materia: string; nombre_categoria: string }) {
    try {
        // Get the next num_categoria for this materia
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
