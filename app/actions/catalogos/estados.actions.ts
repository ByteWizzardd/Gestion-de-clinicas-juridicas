'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllEstados } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all estados
 */
export async function getEstados() {
    try {
        const estados = await getAllEstados();
        return { success: true, data: estados };
    } catch (error) {
        console.error('Error getting estados:', error);
        return { success: false, error: 'Error al obtener estados' };
    }
}

/**
 * Create a new estado
 */
export async function createEstado(data: { nombre_estado: string }) {
    try {
        console.log('🔵 createEstado called with:', data);
        const result = await pool.query(
            'INSERT INTO estados (nombre_estado) VALUES ($1) RETURNING *',
            [data.nombre_estado]
        );
        console.log('✅ Estado created successfully:', result.rows[0]);
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating estado:', error);
        return { success: false, error: 'Error al crear estado' };
    }
}

/**
 * Update an estado
 */
export async function updateEstado(id: number, data: { nombre_estado: string }) {
    try {
        const result = await pool.query(
            'UPDATE estados SET nombre_estado = $2 WHERE id_estado = $1 RETURNING *',
            [id, data.nombre_estado]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Estado no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar estado: ${errorMessage}` };
    }
}

/**
 * Toggle habilitado status of an estado
 */
export async function toggleEstadoHabilitado(id: number) {
    try {
        const result = await pool.query(
            'UPDATE estados SET habilitado = NOT habilitado WHERE id_estado = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Estado no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error toggling estado habilitado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    }
}

/**
 * Delete an estado (only if no associations exist)
 */
export async function deleteEstado(id: number) {
    try {
        // Check for associations
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM municipios WHERE id_estado = $1
                UNION
                SELECT 1 FROM clientes WHERE id_estado = $1
            ) AS has_associations`,
            [id]
        );

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este estado porque tiene municipios o clientes asociados. Deshabilítelo en su lugar.'
            };
        }

        // No associations, safe to delete
        const result = await pool.query(
            'DELETE FROM estados WHERE id_estado = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return { success: false, error: 'Estado no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error deleting estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar estado: ${errorMessage}` };
    }
}
