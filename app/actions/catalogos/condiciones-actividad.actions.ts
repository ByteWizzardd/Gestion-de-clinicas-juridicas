'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesActividad } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all condiciones de actividad
 */
export async function getCondicionesActividad() {
    try {
        const condiciones = await getAllCondicionesActividad();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de actividad:', error);
        return { success: false, error: 'Error al obtener condiciones de actividad' };
    }
}

/**
 * Create a new condicion de actividad
 */
export async function createCondicionActividad(data: { nombre_actividad: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO condicion_actividad (nombre_actividad) VALUES ($1) RETURNING *',
            [data.nombre_actividad]
        );
        revalidatePath('/dashboard/catalogs/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating condicion actividad:', error);
        return { success: false, error: 'Error al crear condición de actividad' };
    }
}
