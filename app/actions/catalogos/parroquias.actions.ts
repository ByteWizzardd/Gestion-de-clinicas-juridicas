'use server';

import { pool } from '@/lib/db/pool';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllParroquias } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getParroquias() {
    try {
        const parroquias = await getAllParroquias();
        return { success: true, data: parroquias };
    } catch (error) {
        logger.error('Error getting parroquias:', error);
        return { success: false, error: 'Error al obtener parroquias' };
    }
}

export async function createParroquia(data: { id_estado: string; id_municipio: string; nombre_parroquia: string }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const id_estado = parseInt(data.id_estado);
        const num_municipio = parseInt(data.id_municipio);

        const maxResult = await client.query(
            'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
            [id_estado, num_municipio]
        );
        const nextNum = maxResult.rows[0].next_num;

        const result = await client.query(
            'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_estado, num_municipio, nextNum, data.nombre_parroquia]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating parroquia:', error);
        return { success: false, error: 'Error al crear parroquia' };
    } finally {
        client.release();
    }
}

export async function updateParroquia(id_estado: number, num_municipio: number, num_parroquia: number, data: {
    nombre_parroquia?: string;
    id_estado?: string;
    id_municipio?: string;
}) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        const target_id_estado = data.id_estado ? parseInt(data.id_estado) : id_estado;
        const target_num_municipio = data.id_municipio ? parseInt(data.id_municipio) : num_municipio;
        const nombre_parroquia = data.nombre_parroquia;

        // Check if hierarchy changed
        const hierarchyChanged = (
            target_id_estado !== id_estado ||
            target_num_municipio !== num_municipio
        );

        if (!hierarchyChanged) {
            // Simple update (just name) - triggers update audit
            if (!nombre_parroquia) {
                await client.query('ROLLBACK');
                return { success: false, error: 'No se proporcionaron campos para actualizar' };
            }

            await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

            const result = await client.query(
                'UPDATE parroquias SET nombre_parroquia = $4 WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
                [id_estado, num_municipio, num_parroquia, nombre_parroquia]
            );
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Parroquia no encontrada' };
            }

            await client.query('COMMIT');
            revalidatePath('/dashboard/administration/parroquias');
            return { success: true, data: result.rows[0] };
        } else {
            // Moving to a different state/municipio: Delete from old + Insert into new

            // Check for associations that would prevent the move
            const checkResult = await client.query(
                `SELECT EXISTS (
                    SELECT 1 FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
                    UNION
                    SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
                ) AS has_associations`,
                [id_estado, num_municipio, num_parroquia]
            );
            if (checkResult.rows[0]?.has_associations === true) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    error: 'HAS_ASSOCIATIONS',
                    message: 'No se puede mover la parroquia porque tiene núcleos o solicitantes asociados.'
                };
            }

            // Get the original record data before deletion
            const originalRecord = await client.query(
                'SELECT * FROM parroquias WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3',
                [id_estado, num_municipio, num_parroquia]
            );
            if (originalRecord.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, error: 'Parroquia no encontrada' };
            }

            const finalNombre = nombre_parroquia || originalRecord.rows[0].nombre_parroquia;

            // Get the destination state and municipio names for the audit reason
            const destLocation = await client.query(
                `SELECT e.nombre_estado, m.nombre_municipio 
                 FROM estados e 
                 LEFT JOIN municipios m ON m.id_estado = $1 AND m.num_municipio = $2
                 WHERE e.id_estado = $1`,
                [target_id_estado, target_num_municipio]
            );
            const nombreEstado = destLocation.rows[0]?.nombre_estado || `Estado ID: ${target_id_estado}`;
            const nombreMunicipio = destLocation.rows[0]?.nombre_municipio || `Municipio #${target_num_municipio}`;

            // 1. Delete from original location (triggers deletion audit)
            await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
            await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [`Movido a: ${nombreEstado} - ${nombreMunicipio}`]);

            await client.query(
                'DELETE FROM parroquias WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3',
                [id_estado, num_municipio, num_parroquia]
            );

            // 2. Get next num_parroquia for the new location
            const maxResult = await client.query(
                'SELECT COALESCE(MAX(num_parroquia), 0) + 1 as next_num FROM parroquias WHERE id_estado = $1 AND num_municipio = $2',
                [target_id_estado, target_num_municipio]
            );
            const nextNum = maxResult.rows[0].next_num;

            // 3. Insert into new location (triggers insertion audit)
            await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

            const result = await client.query(
                'INSERT INTO parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia, habilitado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [target_id_estado, target_num_municipio, nextNum, finalNombre, originalRecord.rows[0].habilitado]
            );

            await client.query('COMMIT');
            revalidatePath('/dashboard/administration/parroquias');
            return { success: true, data: result.rows[0] };
        }
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error updating parroquia:', error);
        return { success: false, error: 'Error al actualizar parroquia' };
    } finally {
        client.release();
    }
}

export async function toggleParroquiaHabilitado(id_estado: number, num_municipio: number, num_parroquia: number) {
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
            'UPDATE parroquias SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Parroquia no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error toggling parroquia habilitado:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

export async function deleteParroquia(id_estado: number, num_municipio: number, num_parroquia: number, motivo?: string) {
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
                SELECT 1 FROM nucleos WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
                UNION
                SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3
            ) AS has_associations`,
            [id_estado, num_municipio, num_parroquia]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene núcleos o solicitantes asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query(
            'DELETE FROM parroquias WHERE id_estado = $1 AND num_municipio = $2 AND num_parroquia = $3 RETURNING *',
            [id_estado, num_municipio, num_parroquia]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Parroquia no encontrada' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/parroquias');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error deleting parroquia:', error);
        return { success: false, error: 'Error al eliminar parroquia' };
    } finally {
        client.release();
    }
}
