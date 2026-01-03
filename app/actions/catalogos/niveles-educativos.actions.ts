'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllNivelesEducativos } from '@/lib/db/queries/catalogos.queries';
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
    try {
        console.log('🔵 createNivelEducativo called with:', data);
        const query = loadQuery('create-nivel-educativo.sql');
        const result = await pool.query(query, [data.descripcion]);
        console.log('✅ Nivel educativo created successfully:', result.rows[0]);
        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating nivel educativo:', error);
        return { success: false, error: 'Error al crear nivel educativo' };
    }
}

/**
 * Update a nivel educativo
 */
export async function updateNivelEducativo(id: number, data: { descripcion: string }) {
    try {
        const query = loadQuery('update-nivel-educativo.sql');
        const result = await pool.query(query, [id, data.descripcion]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating nivel educativo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al actualizar nivel educativo: ${errorMessage}` };
    }
}

/**
 * Toggle habilitado status of a nivel educativo
 */
export async function toggleNivelEducativoHabilitado(id: number) {
    try {
        const query = loadQuery('toggle-nivel-educativo-habilitado.sql');
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error toggling nivel educativo habilitado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al cambiar estado: ${errorMessage}` };
    }
}

/**
 * Delete a nivel educativo (only if no associations exist)
 */
export async function deleteNivelEducativo(id: number) {
    try {
        // Check for associations
        const checkQuery = loadQuery('check-nivel-educativo-associations.sql');
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este nivel educativo porque tiene solicitantes o familias asociadas. Deshabilítelo en su lugar.'
            };
        }

        // No associations, safe to delete
        const query = loadQuery('delete-nivel-educativo.sql');
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return { success: false, error: 'Nivel educativo no encontrado' };
        }

        revalidatePath('/dashboard/catalogs/niveles-educativos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error deleting nivel educativo:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al eliminar nivel educativo: ${errorMessage}` };
    }
}
