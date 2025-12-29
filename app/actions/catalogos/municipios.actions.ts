'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllMunicipios } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all municipios
 */
export async function getMunicipios() {
    try {
        const municipios = await getAllMunicipios();
        return { success: true, data: municipios };
    } catch (error) {
        console.error('Error getting municipios:', error);
        return { success: false, error: 'Error al obtener municipios' };
    }
}

/**
 * Create a new municipio
 */
export async function createMunicipio(data: { id_estado: string; nombre_municipio: string }) {
    try {
        // Get the next num_municipio for this estado
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
            [parseInt(data.id_estado)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(data.id_estado), nextNum, data.nombre_municipio]
        );
        revalidatePath('/dashboard/catalogs/municipios');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating municipio:', error);
        return { success: false, error: 'Error al crear municipio' };
    }
}
