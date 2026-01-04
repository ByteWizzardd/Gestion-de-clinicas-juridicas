'use server';

import { pool } from '@/lib/db/pool';
import { revalidatePath } from 'next/cache';
import { getAllCaracteristicas } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_caracteristica), 0) + 1 as next_num FROM caracteristicas WHERE id_tipo_caracteristica = $1',
            [parseInt(data.id_tipo_caracteristica)]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await client.query(
            'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, true) RETURNING *',
            [parseInt(data.id_tipo_caracteristica), nextNum, data.descripcion]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating caracteristica:', error);
        return { success: false, error: 'Error al crear característica' };
    } finally {
        client.release();
    }
}

export async function updateCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number, data: { descripcion: string; new_id_tipo_caracteristica?: string }) {
    try {
        // Si no se proporciona un nuevo tipo o es el mismo, solo actualizamos la descripción
        if (!data.new_id_tipo_caracteristica || parseInt(data.new_id_tipo_caracteristica) === id_tipo_caracteristica) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const authResult = await requireAuthInServerActionWithCode();
                if (!authResult.success || !authResult.user) {
                    await client.query('ROLLBACK');
                    return { success: false, error: 'No autorizado' };
                }

                await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

                const result = await client.query(
                    'UPDATE caracteristicas SET descripcion = $3 WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
                    [id_tipo_caracteristica, num_caracteristica, data.descripcion]
                );
                if (result.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return { success: false, error: 'Característica no encontrada' };
                }

                await client.query('COMMIT');
                revalidatePath('/dashboard/catalogs/caracteristicas');
                return { success: true, data: result.rows[0] };
            } catch (error) {
                await client.query('ROLLBACK');
                console.error('Error updating caracteristica:', error);
                return { success: false, error: 'Error al actualizar característica' };
            } finally {
                client.release();
            }
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

            const authResult = await requireAuthInServerActionWithCode();
            if (!authResult.success || !authResult.user) {
                await client.query('ROLLBACK');
                return { success: false, error: 'No autorizado' };
            }

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

            // Establecer variable de sesión para creación
            await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

            const insertResult = await client.query(
                'INSERT INTO caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, habilitado) VALUES ($1, $2, $3, $4) RETURNING *',
                [newTypeId, nextNum, data.descripcion, isEnabled]
            );

            // 3. Establecer variables de sesión para eliminación
            await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
            await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", ['Movido a nuevo tipo']);

            // 4. Borrar el viejo
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'UPDATE caracteristicas SET habilitado = NOT habilitado WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Característica no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error toggling caracteristica habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteCaracteristica(id_tipo_caracteristica: number, num_caracteristica: number, motivo?: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM asignadas_a WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2
            ) AS has_associations`,
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque está asociada a viviendas de clientes.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM caracteristicas WHERE id_tipo_caracteristica = $1 AND num_caracteristica = $2 RETURNING *',
            [id_tipo_caracteristica, num_caracteristica]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Característica no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/catalogs/caracteristicas');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting caracteristica:', error);
        return { success: false, error: 'Error al eliminar característica' };
    } finally {
        client.release();
    }
}
