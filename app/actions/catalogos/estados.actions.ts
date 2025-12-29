'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllEstados } from '@/lib/db/queries/catalogos.queries';

/**
 * Get all estados
 */
export async function getEstados() {
    try {
        const estados = await getAllEstados();
        return { success: true, data: estados };
    } catch (error) {
        console.error('Error getting estados:', error);
        return { success: false, error: 'Error al obtener estados' };
    }
}

/**
 * Create a new estado
 */
export async function createEstado(data: { nombre_estado: string }) {
    try {
        console.log('🔵 createEstado called with:', data);
        const result = await pool.query(
            'INSERT INTO estados (nombre_estado) VALUES ($1) RETURNING *',
            [data.nombre_estado]
        );
        console.log('✅ Estado created successfully:', result.rows[0]);
        revalidatePath('/dashboard/catalogs/estados');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('❌ Error creating estado:', error);
        return { success: false, error: 'Error al crear estado' };
    }
}
