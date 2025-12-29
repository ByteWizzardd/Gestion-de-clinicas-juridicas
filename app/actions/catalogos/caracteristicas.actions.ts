'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCaracteristicas } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all caracteristicas
 */
export async function getCaracteristicas() {
    try {
        const caracteristicas = await getAllCaracteristicas();
        return { success: true, data: caracteristicas };
    } catch (error) {
        console.error('Error getting caracteristicas:', error);
        return { success: false, error: 'Error al obtener características' };
    }
}

/**
 * Create a new caracteristica
 */
export async function createCaracteristica(data: { id_tipo_caracteristica: string; descripcion: string }) {
    try {
        // Get next num_caracteristica for this tipo
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_caracteristica), 0) + 1 as next_num FROM caracteristicas WHERE id_tipo_caracteristica = $1',
            [parseInt(data.id_tipo_caracteristica)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, true) RETURNING *',
            [parseInt(data.id_tipo_caracteristica), nextNum, data.descripcion]
        );
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating caracteristica:', error);
        return { success: false, error: 'Error al crear característica' };
    }
}
