'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllSemestres } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all semestres
 */
export async function getSemestres() {
    try {
        const semestres = await getAllSemestres();
        return { success: true, data: semestres };
    } catch (error) {
        console.error('Error getting semestres:', error);
        return { success: false, error: 'Error al obtener semestres' };
    }
}

/**
 * Create a new semestre
 */
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
