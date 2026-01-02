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
                // Cascading Move Operation

                // 1. Get new num_categoria for target materia
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_categoria), 0) + 1 as next_num FROM categorias WHERE id_materia = $1',
                    [target_id_materia]
                );
                const nextNum = maxResult.rows[0].next_num;

                // 2. Insert new category
                const insertResult = await client.query(
                    'INSERT INTO categorias (id_materia, num_categoria, nombre_categoria) VALUES ($1, $2, $3) RETURNING *',
                    [target_id_materia, nextNum, data.nombre_categoria]
                );
                const newCategory = insertResult.rows[0];

                // 3. Move Subcategories
                const subcategorias = await client.query(
                    'SELECT * FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
                    [id_materia, num_categoria]
                );

                for (const sub of subcategorias.rows) {
                    const old_num_sub = sub.num_subcategoria;

                    await client.query(
                        'INSERT INTO subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES ($1, $2, $3, $4)',
                        [target_id_materia, nextNum, sub.num_subcategoria, sub.nombre_subcategoria]
                    );

                    // 4. Move Ambitos Legales
                    const ambitos = await client.query(
                        'SELECT * FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
                        [id_materia, num_categoria, old_num_sub]
                    );

                    for (const ambito of ambitos.rows) {
                        const old_num_ambito = ambito.num_ambito_legal;

                        await client.query(
                            'INSERT INTO ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES ($1, $2, $3, $4, $5)',
                            [target_id_materia, nextNum, sub.num_subcategoria, ambito.num_ambito_legal, ambito.nombre_ambito_legal]
                        );

                        // 5. Update Casos references
                        await client.query(
                            `UPDATE casos 
                             SET id_materia = $1, num_categoria = $2, num_subcategoria = $3, num_ambito_legal = $4
                             WHERE id_materia = $5 AND num_categoria = $6 AND num_subcategoria = $7 AND num_ambito_legal = $8`,
                            [
                                target_id_materia, nextNum, sub.num_subcategoria, ambito.num_ambito_legal, // NEW keys
                                id_materia, num_categoria, old_num_sub, old_num_ambito // OLD keys
                            ]
                        );

                        // Delete old Ambito
                        await client.query(
                            'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4',
                            [id_materia, num_categoria, old_num_sub, old_num_ambito]
                        );
                    }

                    // Delete old Subcategory
                    await client.query(
                        'DELETE FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
                        [id_materia, num_categoria, old_num_sub]
                    );
                }

                // 6. Delete old Category
                await client.query(
                    'DELETE FROM categorias WHERE id_materia = $1 AND num_categoria = $2',
                    [id_materia, num_categoria]
                );

                await client.query('COMMIT');
                revalidatePath('/dashboard/catalogs/categorias');
                return { success: true, data: newCategory };
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
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Check for Active Cases in the entire hierarchy
            // We need to check if ANY case points to ANY ambito legal that belongs to ANY subcategory of THIS category.
            const checkCases = await client.query(
                `SELECT 1 FROM casos 
                 WHERE id_materia = $1 AND num_categoria = $2
                 LIMIT 1`,
                [id_materia, num_categoria]
            );

            if ((checkCases.rowCount ?? 0) > 0) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    error: 'HAS_IN_USE',
                    message: 'No se puede eliminar la categoría porque hay Expedientes (Casos) activos asociados a ella o sus subcategorías.'
                };
            }

            // 2. Cascading Delete (Safe because no cases exist)

            // Delete Ambitos Legales
            await client.query(
                'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2',
                [id_materia, num_categoria]
            );

            // Delete Subcategories
            await client.query(
                'DELETE FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
                [id_materia, num_categoria]
            );

            // Delete Category
            const result = await client.query(
                'DELETE FROM categorias WHERE id_materia = $1 AND num_categoria = $2 RETURNING *',
                [id_materia, num_categoria]
            );

            await client.query('COMMIT');
            if (result.rows.length === 0) return { success: false, error: 'Categoría no encontrada' };
            revalidatePath('/dashboard/catalogs/categorias');
            return { success: true, data: result.rows[0] };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        return { success: false, error: 'Error al eliminar categoría' };
    }
}
