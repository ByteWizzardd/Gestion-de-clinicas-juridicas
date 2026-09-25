'use server';

import { pool } from '@/lib/db/pool';
import { withAuditTransaction } from '@/lib/utils/audit-context';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllSemestres } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { toUserMessage } from '@/lib/utils/error-messages';
import { validarSemestre } from '@/lib/validations/semestre';

export async function getSemestres() {
    try {
        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            return { success: false, error: 'No autorizado' };
        }

        const semestres = await getAllSemestres();
        return { success: true, data: semestres };
    } catch (error) {
        logger.error('Error getting semestres:', error);
        return { success: false, error: 'Error al obtener semestres' };
    }
}

export async function checkSemestreExists(term: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { exists: false };
    }

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT 1 FROM semestres WHERE term = $1', [term]);
        return { exists: result.rows.length > 0 };
    } catch (error) {
        logger.error('Error checking semestre exists:', error);
        return { exists: false };
    } finally {
        client.release();
    }
}

export async function createSemestre(data: { term: string; fecha_inicio: string; fecha_fin: string }) {
    // Validar formato YYYY-XX y que las fechas caigan en la ventana del semestre
    const errorSemestre = validarSemestre(data.term, data.fecha_inicio, data.fecha_fin);
    if (errorSemestre) {
        return { success: false, error: errorSemestre };
    }

    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Creación en catálogo Semestres' },
        async (client) => {
            const result = await client.query(
                'INSERT INTO semestres (term, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
                [data.term, data.fecha_inicio, data.fecha_fin]
            );

            revalidatePath('/dashboard/administration/semestres');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error creating semestre:', error);
        if (error.code === '23505') {
            return { success: false, error: 'Este semestre ya existe' };
        }
        return { success: false, error: toUserMessage(error, 'Error al crear semestre') };
    });
}

export async function updateSemestre(term: string, data: { fecha_inicio: string; fecha_fin: string; new_term?: string }) {
    const errorSemestre = validarSemestre(data.new_term || term, data.fecha_inicio, data.fecha_fin);
    if (errorSemestre) {
        return { success: false, error: errorSemestre };
    }

    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Actualización en catálogo Semestres' },
        async (client) => {
            const targetTerm = data.new_term || term;

            const result = await client.query(
                'UPDATE semestres SET fecha_inicio = $2, fecha_fin = $3, term = $4 WHERE term = $1 RETURNING *',
                [term, data.fecha_inicio, data.fecha_fin, targetTerm]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/semestres');
            return { success: true, data: result.rows[0] };
        }
    ).catch((error: any) => {
        logger.error('Error updating semestre:', error);

        if (error.code === '23505') {
            return { success: false, error: 'Este semestre ya existe' };
        }
        if (error.code === '23503') {
            return { success: false, error: 'No se puede cambiar el nombre del semestre porque tiene registros asociados' };
        }
        if (error.message === 'NOT_FOUND') {
            return { success: false, error: 'Semestre no encontrado' };
        }

        return { success: false, error: toUserMessage(error, 'Error al actualizar semestre') };
    });
}

export async function toggleSemestreHabilitado(term: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Cambio de estado en catálogo Semestres' },
        async (client) => {
            const result = await client.query(
                'UPDATE semestres SET habilitado = NOT habilitado WHERE term = $1 RETURNING *',
                [term]
            );
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/semestres');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error toggling semestre:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Semestre no encontrado' };
        return { success: false, error: toUserMessage(error, 'Error al cambiar estado') };
    });
}

/**
 * Cierra un semestre: deshabilita del sistema a todos los profesores y estudiantes
 * asignados a ese term. Los coordinadores NUNCA se ven afectados.
 */
export async function cerrarSemestre(term: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }
    const userCedula = authResult.user.cedula;

    return await withAuditTransaction(
        userCedula,
        { accion_negocio: 'Cierre de Semestre' },
        async (client) => {
            // Obtener cédulas de estudiantes habilitados del semestre
            const estudiantesRes = await client.query<{ cedula: string }>(`
                SELECT u.cedula
                FROM usuarios u
                JOIN estudiantes e ON e.cedula_estudiante = u.cedula
                WHERE e.term = $1
                  AND u.habilitado_sistema = true
            `, [term]);

            // Obtener cédulas de profesores habilitados del semestre
            const profesoresRes = await client.query<{ cedula: string }>(`
                SELECT u.cedula
                FROM usuarios u
                JOIN profesores p ON p.cedula_profesor = u.cedula
                WHERE p.term = $1
                  AND u.habilitado_sistema = true
            `, [term]);

            const cedulas = [
                ...estudiantesRes.rows.map((r: { cedula: string }) => r.cedula),
                ...profesoresRes.rows.map((r: { cedula: string }) => r.cedula),
            ];

            // Deshabilitar cada usuario individualmente (registra auditoría)
            for (const cedula of cedulas) {
                await client.query('SELECT toggle_habilitado_usuario($1, $2)', [cedula, userCedula]);
            }

            revalidatePath('/dashboard/users');
            return { success: true, count: cedulas.length };
        }
    ).catch(error => {
        logger.error('Error cerrando semestre:', error);
        return { success: false, error: toUserMessage(error, 'Error al cerrar semestre') };
    });
}

export async function deleteSemestre(term: string, motivo?: string) {
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        const checkResult = await client.query(
            `SELECT EXISTS (
                SELECT 1 FROM coordinadores WHERE term = $1
                UNION
                SELECT 1 FROM estudiantes WHERE term = $1
                UNION
                SELECT 1 FROM profesores WHERE term = $1
            ) AS has_associations`,
            [term]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este semestre porque tiene usuarios (estudiantes, profesores o coordinadores) asociados.'
            };
        }
    } finally {
        client.release();
    }

    return await withAuditTransaction(
        authResult.user.cedula,
        { accion_negocio: 'Eliminación en catálogo Semestres', motivo: motivo || '' },
        async (client) => {
            const result = await client.query('DELETE FROM semestres WHERE term = $1 RETURNING *', [term]);
            if (result.rows.length === 0) {
                throw new Error('NOT_FOUND');
            }

            revalidatePath('/dashboard/administration/semestres');
            return { success: true, data: result.rows[0] };
        }
    ).catch(error => {
        logger.error('Error deleting semestre:', error);
        if (error.message === 'NOT_FOUND') return { success: false, error: 'Semestre no encontrado' };
        return { success: false, error: toUserMessage(error, 'Error al eliminar semestre') };
    });
}
