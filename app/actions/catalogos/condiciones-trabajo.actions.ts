'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCondicionesTrabajo } from '@/lib/db/queries/catalogos.queries';

export async function getCondicionesTrabajo() {
    try {
        const condiciones = await getAllCondicionesTrabajo();
        return { success: true, data: condiciones };
    } catch (error) {
        console.error('Error getting condiciones de trabajo:', error);
        return { success: false, error: 'Error al obtener condiciones de trabajo' };
    }
}

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

export async function updateCondicionTrabajo(id: number, data: { nombre_trabajo: string }) {
    try {
        const result = await pool.query(
            'UPDATE condicion_trabajo SET nombre_trabajo = $2 WHERE id_trabajo = $1 RETURNING *',
            [id, data.nombre_trabajo]
        );
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al actualizar condición' };
    }
}

export async function toggleCondicionTrabajoHabilitado(id: number) {
    try {
        const result = await pool.query(
            'UPDATE condicion_trabajo SET habilitado = NOT habilitado WHERE id_trabajo = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteCondicionTrabajo(id: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (SELECT 1 FROM clientes WHERE id_trabajo = $1) AS has_associations`,
            [id]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene clientes asociados.'
            };
        }
        const result = await pool.query('DELETE FROM condicion_trabajo WHERE id_trabajo = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return { success: false, error: 'Condición no encontrada' };
        revalidatePath('/dashboard/catalogs/condiciones-trabajo');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar condición' };
    }
}
