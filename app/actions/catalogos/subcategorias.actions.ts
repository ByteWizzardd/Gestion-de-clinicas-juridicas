'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllSubcategorias } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getSubcategorias() {
    try {
        const subcategorias = await getAllSubcategorias();
        return { success: true, data: subcategorias };
    } catch (error) {
        logger.error('Error getting subcategorias:', error);
        return { success: false, error: 'Error al obtener subcategorías' };
    }
}

export async function createSubcategoria(data: { id_materia: string; num_categoria: string; nombre_subcategoria: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Subcategorías' },
        async (client) => {
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

            revalidatePath('/dashboard/administration/subcategorias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating subcategoria:', error);
        return { success: false, error: 'Error al crear subcategoría' };
    });
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
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Subcategorías' },
        async (client) => {
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

                // Obtener nombres para auditoría
                const destHierarchy = await client.query(
                    `SELECT m.nombre_materia, c.nombre_categoria
                     FROM materias m
                     LEFT JOIN categorias c ON c.id_materia = $1 AND c.num_categoria = $2
                     WHERE m.id_materia = $1`,
                    [newIdMateria, newNumCategoria]
                );
                const nombreMateria = destHierarchy.rows[0]?.nombre_materia || `Materia ID: ${newIdMateria}`;
                const nombreCategoria = destHierarchy.rows[0]?.nombre_categoria || `Categoría #${newNumCategoria}`;

                await client.query("SELECT set_config('app.audit_metadata', $1, true)", [JSON.stringify({ motivo: `Movido a: ${nombreMateria} > ${nombreCategoria}`, accion_negocio: 'Actualización en catálogo Subcategorías' })]);

                // Actualizar todos los campos incluyendo la clave primaria
                const result = await client.query(
                    `UPDATE subcategorias 
                     SET id_materia = $4, num_categoria = $5, num_subcategoria = $6, nombre_subcategoria = $7
                     WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 
                     RETURNING *`,
                    [id_materia, num_categoria, num_subcategoria, newIdMateria, newNumCategoria, newNumSubcategoria, data.nombre_subcategoria]
                );
                if (result.rows.length === 0) {
                    throw new Error('NOT_FOUND');
                }

                revalidatePath('/dashboard/administration/subcategorias');
                return { success: true, data: result.rows[0] };
            } else {
                // Solo actualizar el nombre
                const result = await client.query(
                    'UPDATE subcategorias SET nombre_subcategoria = $4 WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
                    [id_materia, num_categoria, num_subcategoria, data.nombre_subcategoria]
                );
                if (result.rows.length === 0) {
                    throw new Error('NOT_FOUND');
                }

                revalidatePath('/dashboard/administration/subcategorias');
                return { success: true, data: result.rows[0] };
            }
        }
    ).catch(error => {
        logger.error('Error updating subcategoria:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Subcategoría no encontrada' };
        return { success: false, error: 'Error al actualizar subcategoría' };
    });
}

export async function toggleSubcategoriaHabilitado(id_materia: number, num_categoria: number, num_subcategoria: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Subcategorías' },
        async (client) => {
            const result = await client.query(
                'UPDATE subcategorias SET habilitado = NOT habilitado WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
                [id_materia, num_categoria, num_subcategoria]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/subcategorias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling subcategoria habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Subcategoría no encontrada' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteSubcategoria(id_materia: number, num_categoria: number, num_subcategoria: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
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
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Subcategorías', motivo: motivo || '' },
        async (client) => {
            const result = await client.query(
                'DELETE FROM subcategorias WHERE id_materia = $1 AND num_categoria = $2 AND num_subcategoria = $3 RETURNING *',
                [id_materia, num_categoria, num_subcategoria]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/subcategorias');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting subcategoria:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Subcategoría no encontrada' };
        return { success: false, error: 'Error al eliminar subcategoría' };
    });
}
