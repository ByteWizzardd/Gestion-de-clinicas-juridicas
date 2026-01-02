'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllSemestres } from '@/lib/db/queries/catalogos.queries';

export async function getSemestres() {
    try {
        const semestres = await getAllSemestres();
        return { success: true, data: semestres };
    } catch (error) {
        console.error('Error getting semestres:', error);
        return { success: false, error: 'Error al obtener semestres' };
    }
}

export async function createSemestre(data: { term: string; fecha_inicio: string; fecha_fin: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO semestres (term, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [data.term, data.fecha_inicio, data.fecha_fin]
        );
        revalidatePath('/dashboard/catalogs/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating semestre:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear semestre: ${errorMessage}` };
    }
}

export async function updateSemestre(term: string, data: { fecha_inicio: string; fecha_fin: string }) {
    try {
        const result = await pool.query(
            'UPDATE semestres SET fecha_inicio = $2, fecha_fin = $3 WHERE term = $1 RETURNING *',
            [term, data.fecha_inicio, data.fecha_fin]
        );
        if (result.rows.length === 0) return { success: false, error: 'Semestre no encontrado' };
        revalidatePath('/dashboard/catalogs/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error updating semestre:', error);
        return { success: false, error: 'Error al actualizar semestre' };
    }
}

export async function toggleSemestreHabilitado(term: string) {
    try {
        const result = await pool.query(
            'UPDATE semestres SET habilitado = NOT habilitado WHERE term = $1 RETURNING *',
            [term]
        );
        if (result.rows.length === 0) return { success: false, error: 'Semestre no encontrado' };
        revalidatePath('/dashboard/catalogs/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error toggling semestre:', error);
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteSemestre(term: string) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (SELECT 1 FROM casos WHERE term = $1) AS has_associations`,
            [term]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este semestre porque tiene casos asociados.'
            };
        }
        const result = await pool.query('DELETE FROM semestres WHERE term = $1 RETURNING *', [term]);
        if (result.rows.length === 0) return { success: false, error: 'Semestre no encontrado' };
        revalidatePath('/dashboard/catalogs/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error deleting semestre:', error);
        return { success: false, error: 'Error al eliminar semestre' };
    }
}
