'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllTiposCaracteristicas } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all tipos de caracteristicas
 */
export async function getTiposCaracteristicas() {
    try {
        const tipos = await getAllTiposCaracteristicas();
        return { success: true, data: tipos };
    } catch (error) {
        console.error('Error getting tipos de caracteristicas:', error);
        return { success: false, error: 'Error al obtener tipos de características' };
    }
}

/**
 * Create a new tipo caracteristica
 */
export async function createTipoCaracteristica(data: { nombre_tipo_caracteristica: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO tipo_caracteristicas (nombre_tipo_caracteristica) VALUES ($1) RETURNING *',
            [data.nombre_tipo_caracteristica]
        );
        revalidatePath('/dashboard/catalogs/tipos-caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating tipo caracteristica:', error);
        return { success: false, error: 'Error al crear tipo de característica' };
    }
}
