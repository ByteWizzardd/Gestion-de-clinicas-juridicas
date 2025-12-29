'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllNucleos } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all nucleos
 */
export async function getNucleos() {
    try {
        const nucleos = await getAllNucleos();
        return { success: true, data: nucleos };
    } catch (error) {
        console.error('Error getting nucleos:', error);
        return { success: false, error: 'Error al obtener núcleos' };
    }
}

/**
 * Create a new nucleo
 */
export async function createNucleo(data: { id_parroquia: string; nombre_nucleo: string }) {
    try {
        const result = await pool.query(
            'INSERT INTO nucleos (id_parroquia, nombre_nucleo) VALUES ($1, $2) RETURNING *',
            [parseInt(data.id_parroquia), data.nombre_nucleo]
        );
        revalidatePath('/dashboard/catalogs/nucleos');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating nucleo:', error);
        return { success: false, error: 'Error al crear núcleo' };
    }
}
