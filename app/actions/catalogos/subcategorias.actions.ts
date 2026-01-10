'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllSubcategorias } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const id_materia = parseInt(data.id_materia);
        const num_categoria = parseInt(data.num_categoria);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_subcategoria), 0) + 1 as next_num FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
            [id_materia, num_categoria]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await client.query(
            'INSERT INTO subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_materia, num_categoria, nextNum, data.nombre_subcategoria]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating subcategoria:', error);
        return { success: false, error: 'Error al crear subcategoría' };
    } finally {
        client.release();
    }
}

export async function updateSubcategoria(
    id_materia: number, 
    num_categoria: number, 
    num_subcategoria: number, 
    data: { 
        nombre_subcategoria: string;
        new_id_materia?: number;
        new_num_categoria?: number;
    }
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        // Verificar si cambia la materia o categoría
        const cambiaMateria = data.new_id_materia !== undefined && data.new_id_materia !== id_materia;
        const cambiaCategoria = data.new_num_categoria !== undefined && (data.new_num_categoria !== num_categoria || cambiaMateria);

        if (cambiaMateria || cambiaCategoria) {
            // Si cambia materia o categoría, necesitamos actualizar la clave primaria
            const newIdMateria = data.new_id_materia ?? id_materia;
            const newNumCategoria = data.new_num_categoria ?? num_categoria;

            // Verificar que no exista una subcategoría con ese número en la nueva ubicación
            const existCheck = await client.query(
                'SELECT 1 FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
                [newIdMateria, newNumCategoria, num_subcategoria]
            );
            
            // Si ya existe, asignar un nuevo número
            let newNumSubcategoria = num_subcategoria;
            if (existCheck.rows.length > 0) {
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_subcategoria), 0) + 1 as next_num FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2',
                    [newIdMateria, newNumCategoria]
                );
                newNumSubcategoria = maxResult.rows[0].next_num;
            }

            // Actualizar todos los campos incluyendo la clave primaria
            const result = await client.query(
                `UPDATE subcategorias 
                 SET id_materia = $4, num_categoria = $5, num_subcategoria = $6, nombre_subcategoria = $7
                 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 
                 RETURNING *`,
                [id_materia, num_categoria, num_subcategoria, newIdMateria, newNumCategoria, newNumSubcategoria, data.nombre_subcategoria]
            );
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Subcategoría no encontrada' };
            }

            await client.query('COMMIT');
            revalidatePath('/dashboard/administration/subcategorias');
            return { success: true, data: result.rows[0] };
        } else {
            // Solo actualizar el nombre
            const result = await client.query(
                'UPDATE subcategorias SET nombre_subcategoria = $4 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
                [id_materia, num_categoria, num_subcategoria, data.nombre_subcategoria]
            );
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Subcategoría no encontrada' };
            }

            await client.query('COMMIT');
            revalidatePath('/dashboard/administration/subcategorias');
            return { success: true, data: result.rows[0] };
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating subcategoria:', error);
        return { success: false, error: 'Error al actualizar subcategoría' };
    } finally {
        client.release();
    }
}

export async function toggleSubcategoriaHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE subcategorias SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
            [id_materia, num_categoria, num_subcategoria]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Subcategoría no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling subcategoria habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteSubcategoria(id_materia: number, num_categoria: number, num_subcategoria: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3
            ) AS has_associations`,
            [id_materia, num_categoria, num_subcategoria]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene ámbitos legales asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
            [id_materia, num_categoria, num_subcategoria]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Subcategoría no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/subcategorias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting subcategoria:', error);
        return { success: false, error: 'Error al eliminar subcategoría' };
    } finally {
        client.release();
    }
}
