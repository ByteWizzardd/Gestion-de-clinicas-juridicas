'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllAmbitosLegales } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getAmbitosLegales() {
    try {
        const ambitos = await getAllAmbitosLegales();
        return { success: true, data: ambitos };
    } catch (error) {
        console.error('Error getting ambitos legales:', error);
        return { success: false, error: 'Error al obtener ámbitos legales' };
    }
}

export async function createAmbitoLegal(data: { id_materia: string; num_categoria: string; num_subcategoria: string; nombre_ambito_legal: string }) {
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
        const num_subcategoria = parseInt(data.num_subcategoria);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_ambito_legal), 0) + 1 as next_num FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
            [id_materia, num_categoria, num_subcategoria]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await client.query(
            'INSERT INTO ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id_materia, num_categoria, num_subcategoria, nextNum, data.nombre_ambito_legal]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating ambito legal:', error);
        return { success: false, error: 'Error al crear ámbito legal' };
    } finally {
        client.release();
    }
}

export async function updateAmbitoLegal(
    id_materia: number,
    num_categoria: number,
    num_subcategoria: number,
    num_ambito_legal: number,
    data: {
        nombre_ambito_legal: string,
        new_id_materia?: string | number,
        new_num_categoria?: string | number,
        new_num_subcategoria?: string | number
    }
) {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const target_id_materia = data.new_id_materia ? parseInt(data.new_id_materia.toString()) : id_materia;
            const target_num_categoria = data.new_num_categoria ? parseInt(data.new_num_categoria.toString()) : num_categoria;
            const target_num_subcategoria = data.new_num_subcategoria ? parseInt(data.new_num_subcategoria.toString()) : num_subcategoria;

            // Check if hierarchy changed
            const hierarchyChanged = (
                target_id_materia !== id_materia ||
                target_num_categoria !== num_categoria ||
                target_num_subcategoria !== num_subcategoria
            );

            if (!hierarchyChanged) {
                // Simple update
                const authResult = await requireAuthInServerActionWithCode();
                if (!authResult.success || !authResult.user) {
                    await client.query('ROLLBACK');
                    return { success: false, error: 'No autorizado' };
                }

                await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

                const result = await client.query(
                    'UPDATE ambitos_legales SET nombre_ambito_legal = $5 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
                    [id_materia, num_categoria, num_subcategoria, num_ambito_legal, data.nombre_ambito_legal]
                );
                await client.query('COMMIT');
                if (result.rows.length === 0) return { success: false, error: 'Ámbito legal no encontrado' };
                revalidatePath('/dashboard/catalogs/ambitos-legales');
                return { success: true, data: result.rows[0] };
            } else {
                // Move operation
                const authResult = await requireAuthInServerActionWithCode();
                if (!authResult.success || !authResult.user) {
                    await client.query('ROLLBACK');
                    return { success: false, error: 'No autorizado' };
                }

                // 1. Get new ID
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_ambito_legal), 0) + 1 as next_num FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
                    [target_id_materia, target_num_categoria, target_num_subcategoria]
                );
                const nextNum = maxResult.rows[0].next_num;

                // 2. Insert new record
                await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);
                const insertResult = await client.query(
                    'INSERT INTO ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [target_id_materia, target_num_categoria, target_num_subcategoria, nextNum, data.nombre_ambito_legal]
                );
                const newRecord = insertResult.rows[0];

                // 3. Move related 'casos'
                await client.query(
                    `UPDATE casos 
                     SET id_materia = $1, num_categoria = $2, num_subcategoria = $3, num_ambito_legal = $4 
                     WHERE id_materia = $5 AND num_categoria = $6 AND num_subcategoria = $7 AND num_ambito_legal = $8`,
                    [target_id_materia, target_num_categoria, target_num_subcategoria, nextNum,
                        id_materia, num_categoria, num_subcategoria, num_ambito_legal]
                );

                // 4. Delete old record (set session variables for audit trigger)
                await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
                await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", ['Movido a nueva jerarquía']);
                await client.query(
                    'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4',
                    [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
                );

                await client.query('COMMIT');
                revalidatePath('/dashboard/catalogs/ambitos-legales');
                return { success: true, data: newRecord };
            }
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating ambito legal:', error);
        return { success: false, error: 'Error al actualizar ámbito legal' };
    }
}

export async function toggleAmbitoLegalHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number) {
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
            'UPDATE ambitos_legales SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Ámbito legal no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling ambito legal habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteAmbitoLegal(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number, motivo?: string) {
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
                SELECT 1 FROM casos WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4
            ) AS has_associations`,
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene casos asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Ámbito legal no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/ambitos-legales');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting ambito legal:', error);
        return { success: false, error: 'Error al eliminar ámbito legal' };
    } finally {
        client.release();
    }
}
