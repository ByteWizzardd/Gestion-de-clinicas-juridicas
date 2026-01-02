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

export async function updateCategoria(
    id_materia: number,
    num_categoria: number,
    data: {
        nombre_categoria: string,
        new_id_materia?: string | number
    }
) {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const target_id_materia = data.new_id_materia ? parseInt(data.new_id_materia.toString()) : id_materia;

            if (target_id_materia !== id_materia) {
                // Move operation
                // 1. Check dependencies (Subcategories)
                const checkDeps = await client.query(
                    'SELECT 1 FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 LIMIT 1',
                    [id_materia, num_categoria]
                );

                if ((checkDeps.rowCount ?? 0) > 0) {
                    await client.query('ROLLBACK');
                    return {
                        success: false,
                        error: 'No se puede cambiar la materia porque esta categoría tiene subcategorías asociadas. Elimine o mueva las subcategorías primero.'
                    };
                }

                // 2. Get new num_categoria for target materia
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_categoria), 0) + 1 as next_num FROM categorias WHERE id_materia = $1',
                    [target_id_materia]
                );
                const nextNum = maxResult.rows[0].next_num;

                // 3. Insert new category
                const insertResult = await client.query(
                    'INSERT INTO categorias (id_materia, num_categoria, nombre_categoria) VALUES ($1, $2, $3) RETURNING *',
                    [target_id_materia, nextNum, data.nombre_categoria]
                );
                const newRecord = insertResult.rows[0];

                // 4. Delete old category
                await client.query(
                    'DELETE FROM categorias WHERE id_materia = $1 AND num_categoria = $2',
                    [id_materia, num_categoria]
                );

                await client.query('COMMIT');
                revalidatePath('/dashboard/catalogs/categorias');
                return { success: true, data: newRecord };
            } else {
                // Simple update (Name only)
                const result = await client.query(
                    'UPDATE categorias SET nombre_categoria = $3 WHERE id_materia = $1 AND num_categoria = $2 RETURNING *',
                    [id_materia, num_categoria, data.nombre_categoria]
                );
                await client.query('COMMIT');
                if (result.rows.length === 0) return { success: false, error: 'Categoría no encontrada' };
                revalidatePath('/dashboard/catalogs/categorias');
                return { success: true, data: result.rows[0] };
            }
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating categoria:', error);
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
