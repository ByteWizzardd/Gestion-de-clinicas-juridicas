'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesTrabajo } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all condiciones de trabajo
 */
export async function getCondicionesTrabajo() {
    try {
        const condiciones = await getAllCondicionesTrabajo();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de trabajo:', error);
        return { success: false, error: 'Error al obtener condiciones de trabajo' };
    }
}

/**
 * Create a new condicion de trabajo
 */
export async function createCondicionTrabajo(data: { nombre_trabajo: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO condicion_trabajo (nombre_trabajo) VALUES ($1) RETURNING *',
            [data.nombre_trabajo]
        );
        revalidatePath('/dashboard/catalogs/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating condicion trabajo:', error);
        return { success: false, error: 'Error al crear condición de trabajo' };
    }
}
