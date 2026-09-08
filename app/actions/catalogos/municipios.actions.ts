'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllMunicipios } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getMunicipios() {
    try {
        const municipios = await getAllMunicipios();
        return { success: true, data: municipios };
    } catch (error) {
        logger.error('Error getting municipios:', error);
        return { success: false, error: 'Error al obtener municipios' };
    }
}

export async function createMunicipio(data: { id_estado: string; nombre_municipio: string }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Municipios' },
        async (client) => {
            const maxResult = await client.query(
                'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
                [parseInt(data.id_estado)]
            );
            const nextNum = maxResult.rows[0].next_num;
            const result = await client.query(
                'INSERT INTO municipios (id_estado, num_municipio, nombre_municipio) VALUES ($1, $2, $3) RETURNING *',
                [parseInt(data.id_estado), nextNum, data.nombre_municipio]
            );

            revalidatePath('/dashboard/administration/municipios');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating municipio:', error);
        return { success: false, error: 'Error al crear municipio' };
    });
}

export async function updateMunicipio(id_estado: number, num_municipio: number, data: { nombre_municipio: string, id_estado?: number }) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Municipios' },
        async (client) => {
            let result;
            // Check if we are moving the municipality to a different state
            if (data.id_estado && data.id_estado !== id_estado) {
                // Moving to a different state: Delete from old + Insert into new
                // This properly triggers deletion and insertion audits

                // Check for associations that would prevent the move
                const checkResult = await client.query(
                    `SELECT EXISTS (
                        SELECT 1 FROM parroquias WHERE id_estado = $1 AND num_municipio = $2
                        UNION
                        SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2
                    ) AS has_associations`,
                    [id_estado, num_municipio]
                );
                if (checkResult.rows[0]?.has_associations === true) {
                    throw new Error('HAS_ASSOCIATIONS');
                }

                // Get the original record data before deletion
                const originalRecord = await client.query(
                    'SELECT * FROM municipios WHERE id_estado = $1 AND num_municipio = $2',
                    [id_estado, num_municipio]
                );
                if (originalRecord.rows.length === 0) {
                    throw new Error('NOT_FOUND');
                }

                // Get the destination state name for the audit reason
                const destEstado = await client.query(
                    'SELECT nombre_estado FROM estados WHERE id_estado = $1',
                    [data.id_estado]
                );
                const nombreEstadoDestino = destEstado.rows[0]?.nombre_estado || `Estado ID: ${data.id_estado}`;

                // Set additional audit metadata just for the deletion side if needed, but withAuditTransaction handles the main.
                await client.query("SELECT set_config('app.audit_metadata', $1, true)", [JSON.stringify({ motivo: `Movido al estado: ${nombreEstadoDestino}`, accion_negocio: 'Actualización en catálogo Municipios' })]);

                await client.query(
                    'DELETE FROM municipios WHERE id_estado = $1 AND num_municipio = $2',
                    [id_estado, num_municipio]
                );

                // 2. Get next num_municipio for the new state
                const maxResult = await client.query(
                    'SELECT COALESCE(MAX(num_municipio), 0) + 1 as next_num FROM municipios WHERE id_estado = $1',
                    [data.id_estado]
                );
                const nextNum = maxResult.rows[0].next_num;

                result = await client.query(
                    'INSERT INTO municipios (id_estado, num_municipio, nombre_municipio, habilitado) VALUES ($1, $2, $3, $4) RETURNING *',
                    [data.id_estado, nextNum, data.nombre_municipio, originalRecord.rows[0].habilitado]
                );
            } else {
                // Standard update (just name) - triggers update audit
                result = await client.query(
                    'UPDATE municipios SET nombre_municipio = $3 WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
                    [id_estado, num_municipio, data.nombre_municipio]
                );

                if (result.rows.length === 0) {
                    throw new Error('NOT_FOUND');
                }
            }

            revalidatePath('/dashboard/administration/municipios');
            return { success: true, data: result.rows[0] };
        }
    ).catch((error: any) => {
        logger.error('Error updating municipio:', error);
        if (error.message === 'HAS_ASSOCIATIONS') {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede mover el municipio porque tiene parroquias o solicitantes asociados.'
            };
        }
        if (error.message === 'NOT_FOUND') {
            return { success: false, error: 'Municipio no encontrado' };
        }
        if (error.code === '23503') { // ForeignKeyViolation
            return { success: false, error: 'No se puede mover el municipio porque tiene registros asociados.' };
        }
        return { success: false, error: 'Error al actualizar municipio: ' + error.message };
    });
}

export async function toggleMunicipioHabilitado(id_estado: number, num_municipio: number) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Municipios' },
        async (client) => {
            const result = await client.query(
                'UPDATE municipios SET habilitado = NOT habilitado WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
                [id_estado, num_municipio]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/municipios');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling municipio habilitado:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Municipio no encontrado' };
        return { success: false, error: 'Error al cambiar estado' };
    });
}

export async function deleteMunicipio(id_estado: number, num_municipio: number, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM parroquias WHERE id_estado = $1 AND num_municipio = $2
                UNION
                SELECT 1 FROM solicitantes WHERE id_estado = $1 AND num_municipio = $2
            ) AS has_associations`,
            [id_estado, num_municipio]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar porque tiene parroquias o solicitantes asociados.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Municipios', motivo: motivo || '' },
        async (client) => {
            const result = await client.query(
                'DELETE FROM municipios WHERE id_estado = $1 AND num_municipio = $2 RETURNING *',
                [id_estado, num_municipio]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/municipios');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting municipio:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Municipio no encontrado' };
        return { success: false, error: 'Error al eliminar municipio' };
    });
}
