'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllNivelesEducativos } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { readFileSync } from 'fs';
import { join } from 'path';

const QUERIES_DIR = join(process.cwd(), 'database', 'queries', 'catalogos');

function loadQuery(filename: string): string {
    return readFileSync(join(QUERIES_DIR, filename), 'utf-8');
}

/**
 * Get all niveles educativos
 */
export async function getNivelesEducativos() {
    try {
        const nivelesEducativos = await getAllNivelesEducativos();
        return { success: true, data: nivelesEducativos };
    } catch (error) {
        console.error('Error getting niveles educativos:', error);
        return { success: false, error: 'Error al obtener niveles educativos' };
    }
}

/**
 * Create a new nivel educativo
 */
export async function createNivelEducativo(data: { descripcion: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const query = loadQuery('create-nivel-educativo.sql');
        const result = await client.query(query, [data.descripcion]);

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating nivel educativo:', error);
        return { success: false, error: 'Error al crear nivel educativo' };
    } finally {
        client.release();
    }
}

/**
 * Update a nivel educativo
 */
export async function updateNivelEducativo(id: number, data: { descripcion: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const query = loadQuery('update-nivel-educativo.sql');
        const result = await client.query(query, [id, data.descripcion]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating nivel educativo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar nivel educativo: ${errorMessage}` };
    } finally {
        client.release();
    }
}

/**
 * Toggle habilitado status of a nivel educativo
 */
export async function toggleNivelEducativoHabilitado(id: number) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const query = loadQuery('toggle-nivel-educativo-habilitado.sql');
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling nivel educativo habilitado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    } finally {
        client.release();
    }
}

/**
 * Delete a nivel educativo (only if no associations exist)
 */
export async function deleteNivelEducativo(id: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        // Check for associations
        const checkQuery = loadQuery('check-nivel-educativo-associations.sql');
        const checkResult = await client.query(checkQuery, [id]);

        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este nivel educativo porque tiene solicitantes o familias asociadas. Deshabilítelo en su lugar.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        // No associations, safe to delete
        const query = loadQuery('delete-nivel-educativo.sql');
        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting nivel educativo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar nivel educativo: ${errorMessage}` };
    } finally {
        client.release();
    }
}
