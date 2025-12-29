'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllParroquias } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all parroquias
 */
export async function getParroquias() {
    try {
        const parroquias = await getAllParroquias();
        return { success: true, data: parroquias };
    } catch (error) {
        console.error('Error getting parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

/**
 * Create a new parroquia
 */
export async function createParroquia(data: { id_municipio: string; nombre_parroquia: string }) {
    try {
        // Get id_estado and num_municipio from municipio
        const munResult = await pool.query(
            'SELECT id_estado, num_municipio FROM municipios WHERE id_municipio = $1',
            [parseInt(data.id_municipio)]
        );

        if (munResult.rows.length === 0) {
            return { success: false, error: 'Municipio no encontrado' };
        }

        const { id_estado, num_municipio } = munResult.rows[0];

        // Get next num_parroquia
        const maxResult = await pool.query(
            'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
            [id_estado, num_municipio]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await pool.query(
            'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, nextNum, data.nombre_parroquia]
        );
        revalidatePath('/dashboard/catalogs/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Error creating parroquia:', error);
        return { success: false, error: 'Error al crear parroquia' };
    }
}
