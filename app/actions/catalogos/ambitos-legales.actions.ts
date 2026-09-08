'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllAmbitosLegales } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getAmbitosLegales() {
    try {
        const ambitos = await getAllAmbitosLegales();
        return { success: true, data: ambitos };
    } catch (error) {
        logger.error('Error getting ambitos legales:', error);
        return { success: false, error: 'Error al obtener ámbitos legales' };
    }
}

export async function createAmbitoLegal(data: { id_materia: string; num_categoria: string; num_subcategoria: string; nombre_ambito_legal: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Ámbitos Legales' },
        async (client) => {
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

            revalidatePath('/dashboard/administration/ambitos-legales');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating ambito legal:', error);
        return { success: false, error: 'Error al crear ámbito legal' };
    });
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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Ámbitos Legales' },
        async (client) => {
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
                const result = await client.query(
                    'UPDATE ambitos_legales SET nombre_ambito_legal = $5 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
                    [id_materia, num_categoria, num_subcategoria, num_ambito_legal, data.nombre_ambito_legal]
                );
                if (result.rows.length === 0) throw new Error('NOT_FOUND');
                revalidatePath('/dashboard/administration/ambitos-legales');
                return { success: true, data: result.rows[0] };
            } else {
                // Move operation
                // 1. Get new ID
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_ambito_legal), 0) + 1 as next_num FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3',
                    [target_id_materia, target_num_categoria, target_num_subcategoria]
                );
                const nextNum = maxResult.rows[0].next_num;

                // 2. Insert new record
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

                // Get the destination hierarchy names for the audit reason
                const destHierarchy = await client.query(
                    `SELECT m.nombre_materia, c.nombre_categoria, s.nombre_subcategoria
                     FROM materias m
                     LEFT JOIN categorias c ON c.id_materia = $1 AND c.num_categoria = $2
                     LEFT JOIN subcategorias s ON s.id_materia = $1 AND s.num_categoria = $2 AND s.num_subcategoria = $3
                     WHERE m.id_materia = $1`,
                    [target_id_materia, target_num_categoria, target_num_subcategoria]
                );
                const nombreMateria = destHierarchy.rows[0]?.nombre_materia || `Materia ID: ${target_id_materia}`;
                const nombreCategoria = destHierarchy.rows[0]?.nombre_categoria || `Categoría #${target_num_categoria}`;
                const nombreSubcategoria = destHierarchy.rows[0]?.nombre_subcategoria || `Subcategoría #${target_num_subcategoria}`;

                // 4. Delete old record (set session variables for audit trigger for deletion side)
                await client.query("SELECT set_config('app.audit_metadata', $1, true)", [JSON.stringify({ motivo: `Movido a: ${nombreMateria} > ${nombreCategoria} > ${nombreSubcategoria}`, accion_negocio: 'Actualización en catálogo Ámbitos Legales' })]);
                await client.query(
                    'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4',
                    [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
                );

                revalidatePath('/dashboard/administration/ambitos-legales');
                return { success: true, data: newRecord };
            }
        }
    ).catch(error => {
        logger.error('Error updating ambito legal:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Ámbito legal no encontrado' };
        return { success: false, error: 'Error al actualizar ámbito legal' };
    });
}

export async function toggleAmbitoLegalHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Ámbitos Legales' },
        async (client) => {
            const result = await client.query(
                'UPDATE ambitos_legales SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
                [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/ambitos-legales');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling ambito legal habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Ámbito legal no encontrado' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteAmbitoLegal(id_materia: number, num_categoria: number, num_subcategoria: number, num_ambito_legal: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM casos WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4
            ) AS has_associations`,
            [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene casos asociados.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Ámbitos Legales', motivo: motivo || '' },
        async (client) => {
            const result = await client.query(
                'DELETE FROM ambitos_legales WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 AND num_ambito_legal = $4 RETURNING *',
                [id_materia, num_categoria, num_subcategoria, num_ambito_legal]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/ambitos-legales');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting ambito legal:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Ámbito legal no encontrado' };
        return { success: false, error: 'Error al eliminar ámbito legal' };
    });
}
