'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllMaterias } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all materias
 */
export async function getMaterias() {
    try {
        const materias = await getAllMaterias();
        return { success: true, data: materias };
    } catch (error) {
        console.error('Error getting materias:', error);
        return { success: false, error: 'Error al obtener materias' };
    }
}

/**
 * Create a new materia
 */
export async function createMateria(data: { nombre_materia: string }) {
    try {
        console.log('🔵 createMateria called with:', data);
        const result = await pool.query(
            'INSERT INTO materias (nombre_materia) VALUES ($1) RETURNING *',
            [data.nombre_materia]
        );
        console.log('✅ Materia created successfully:', result.rows[0]);

        // Revalidate the path to clear Next.js cache
        revalidatePath('/dashboard/catalogs/materias');

        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating materia:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear materia: ${errorMessage}` };
    }
}
