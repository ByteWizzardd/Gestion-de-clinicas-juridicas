'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllEstados } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Obtener usuario actual
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        // Establecer variable de sesión para el trigger de auditoría
        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE estados SET nombre_estado = $2 WHERE id_estado = $1 RETURNING *',
            [id, data.nombre_estado]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Estado no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar estado: ${errorMessage}` };
    } finally {
        client.release();
    }
}

/**
 * Toggle habilitado status of an estado
 */
export async function toggleEstadoHabilitado(id: number) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Obtener usuario actual
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        // Establecer variable de sesión para el trigger de auditoría
        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE estados SET habilitado = NOT habilitado WHERE id_estado = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Estado no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling estado habilitado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    } finally {
        client.release();
    }
}

/**
 * Delete an estado (only if no associations exist)
 */
export async function deleteEstado(id: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Obtener usuario actual
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        // Check for associations
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM municipios WHERE id_estado = $1
                UNION
                SELECT 1 FROM clientes WHERE id_estado = $1
            ) AS has_associations`,
            [id]
        );

        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este estado porque tiene municipios o clientes asociados. Deshabilítelo en su lugar.'
            };
        }

        // Establecer variables de sesión para el trigger de auditoría
        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        // No associations, safe to delete
        const result = await client.query(
            'DELETE FROM estados WHERE id_estado = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Estado no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting estado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar estado: ${errorMessage}` };
    } finally {
        client.release();
    }
}
