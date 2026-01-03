'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesActividad } from '@/lib/db/queries/catalogos.queries';

export async function getCondicionesActividad() {
    try {
        const condiciones = await getAllCondicionesActividad();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de actividad:', error);
        return { success: false, error: 'Error al obtener condiciones de actividad' };
    }
}

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

export async function updateCondicionActividad(id: number, data: { nombre_actividad: string }) {
    try {
        const result = await pool.query(
            'UPDATE condicion_actividad SET nombre_actividad = $2 WHERE id_actividad = $1 RETURNING *',
            [id, data.nombre_actividad]
        );
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar condición' };
    }
}

export async function toggleCondicionActividadHabilitado(id: number) {
    try {
        const result = await pool.query(
            'UPDATE condicion_actividad SET habilitado = NOT habilitado WHERE id_actividad = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteCondicionActividad(id: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (SELECT 1 FROM clientes WHERE id_actividad = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene clientes asociados.'
            };
        }
        const result = await pool.query('DELETE FROM condicion_actividad WHERE id_actividad = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-actividad');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar condición' };
    }
}
