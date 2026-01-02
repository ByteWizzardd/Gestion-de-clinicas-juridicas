'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCaracteristicas } from '@/lib/db/queries/catalogos.queries';

export async function getCaracteristicas() {
    try {
        const caracteristicas = await getAllCaracteristicas();
        return { success: true, data: caracteristicas };
    } catch (error) {
        console.error('Error getting caracteristicas:', error);
        return { success: false, error: 'Error al obtener características' };
    }
}

export async function createCaracteristica(data: { id_tipo_caracteristica: string; descripcion: string }) {
    try {
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

export async function updateCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number, data: { descripcion: string; new_id_tipo_caracteristica?: string }) {
    try {
        // Si no se proporciona un nuevo tipo o es el mismo, solo actualizamos la descripción
        if (!data.new_id_tipo_caracteristica || parseInt(data.new_id_tipo_caracteristica) === id_tipo_caracteristica) {
            const result = await pool.query(
                'UPDATE caracteristicas SET descripcion = $3 WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
                [id_tipo_caracteristica, num_caracteristica, data.descripcion]
            );
            if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
            revalidatePath('/dashboard/catalogs/caracteristicas');
            return { success: true, data: result.rows[0] };
        }

        // Si el tipo cambia, es una operación de "Mover": Crear nuevo + Borrar viejo
        // 1. Verificamos si podemos borrar el viejo (si tiene asociaciones no deberíamos permitir moverlo fácilmente sin reasignar, 
        // pero por simplicidad bloqueamos si tiene asociaciones o requeriríamos lógica más compleja)

        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM asignadas_a WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2
            ) AS has_associations`,
            [id_tipo_caracteristica, num_caracteristica]
        );

        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede cambiar el tipo porque esta característica ya está asociada a viviendas. Cree una nueva en su lugar.'
            };
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 2. Crear nueva en el nuevo tipo
            const newTypeId = parseInt(data.new_id_tipo_caracteristica);
            const maxResult = await client.query(
                'SELECT COALESCE(MAX(num_caracteristica), 0) + 1 as next_num FROM caracteristicas WHERE id_tipo_caracteristica = $1',
                [newTypeId]
            );
            const nextNum = maxResult.rows[0].next_num;

            // Mantener el estado de habilitado original? Por ahora asumimos true o copiamos
            // Primero obtenemos el estado actual
            const currentResult = await client.query(
                'SELECT habilitado FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2',
                [id_tipo_caracteristica, num_caracteristica]
            );
            const isEnabled = currentResult.rows[0]?.habilitado ?? true;

            const insertResult = await client.query(
                'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, $4) RETURNING *',
                [newTypeId, nextNum, data.descripcion, isEnabled]
            );

            // 3. Borrar el viejo
            await client.query(
                'DELETE FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2',
                [id_tipo_caracteristica, num_caracteristica]
            );

            await client.query('COMMIT');
            revalidatePath('/dashboard/catalogs/caracteristicas');
            return { success: true, data: insertResult.rows[0] };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error('Error updating caracteristica:', error);
        return { success: false, error: error.message || 'Error al actualizar característica' };
    }
}

export async function toggleCaracteristicaHabilitado(id_tipo_caracteristica: number, num_caracteristica: number) {
    try {
        const result = await pool.query(
            'UPDATE caracteristicas SET habilitado = NOT habilitado WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al cambiar estado' };
    }
}

export async function deleteCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number) {
    try {
        const checkResult = await pool.query(
            `SELECT EXISTS (
                SELECT 1 FROM asignadas_a WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2
            ) AS has_associations`,
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque está asociada a viviendas de clientes.'
            };
        }
        const result = await pool.query(
            'DELETE FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) return { success: false, error: 'Característica no encontrada' };
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        return { success: false, error: 'Error al eliminar característica' };
    }
}
