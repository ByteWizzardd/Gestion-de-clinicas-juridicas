'use server';

import { pool } from '@/lib/db/pool';
import { logger } from '@/lib/utils/logger';
import { revalidatePath } from 'next/cache';
import { getAllSemestres } from '@/lib/db/queries/catalogos.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';

export async function getSemestres() {
    try {
        const semestres = await getAllSemestres();
        return { success: true, data: semestres };
    } catch (error) {
        logger.error('Error getting semestres:', error);
        return { success: false, error: 'Error al obtener semestres' };
    }
}

export async function checkSemestreExists(term: string) {
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
    const client = await pool.connect();
    try {
        // Validar formato YYYY-XX (ej: 2026-15)
        if (!/^\d{4}-(15|25)$/.test(data.term)) {
            return { success: false, error: 'El formato del semestre debe ser YYYY-15 o YYYY-25 (ej: 2026-15)' };
        }

        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_crea_catalogo', $1, true)", [authResult.user.cedula]);

        const result = await client.query(
            'INSERT INTO semestres (term, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
            [data.term, data.fecha_inicio, data.fecha_fin]
        );

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error('Error creating semestre:', error);
        if (error.code === '23505') {
            return { success: false, error: 'Este semestre ya existe' };
        }
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return { success: false, error: `Error al crear semestre: ${errorMessage}` };
    } finally {
        client.release();
    }
}

export async function updateSemestre(term: string, data: { fecha_inicio: string; fecha_fin: string; new_term?: string }) {
    const client = await pool.connect();
    try {
        if (data.new_term && data.new_term !== term) {
            if (!/^\d{4}-(15|25)$/.test(data.new_term)) {
                return { success: false, error: 'El formato del semestre debe ser YYYY-15 o YYYY-25' };
            }
        }

        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

        await client.query("SELECT set_config('app.usuario_actualiza_catalogo', $1, true)", [authResult.user.cedula]);

        const targetTerm = data.new_term || term;

        const result = await client.query(
            'UPDATE semestres SET fecha_inicio = $2, fecha_fin = $3, term = $4 WHERE term = $1 RETURNING *',
            [term, data.fecha_inicio, data.fecha_fin, targetTerm]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Semestre no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error: any) {
        await client.query('ROLLBACK');
        logger.error('Error updating semestre:', error);

        if (error.code === '23505') {
            return { success: false, error: 'Este semestre ya existe' };
        }
        if (error.code === '23503') {
            return { success: false, error: 'No se puede cambiar el nombre del semestre porque tiene registros asociados' };
        }

        return { success: false, error: 'Error al actualizar semestre' };
    } finally {
        client.release();
    }
}

export async function toggleSemestreHabilitado(term: string) {
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
            'UPDATE semestres SET habilitado = NOT habilitado WHERE term = $1 RETURNING *',
            [term]
        );
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Semestre no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error toggling semestre:', error);
        return { success: false, error: 'Error al cambiar estado' };
    } finally {
        client.release();
    }
}

/**
 * Cierra un semestre: deshabilita del sistema a todos los profesores y estudiantes
 * asignados a ese term. Los coordinadores NUNCA se ven afectados.
 */
export async function cerrarSemestre(term: string) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const authResult = await requireAuthInServerActionWithCode();
        if (!authResult.success || !authResult.user) {
            await client.query('ROLLBACK');
            return { success: false, error: 'No autorizado' };
        }

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
            ...estudiantesRes.rows.map(r => r.cedula),
            ...profesoresRes.rows.map(r => r.cedula),
        ];

        // Deshabilitar cada usuario individualmente (registra auditoría)
        for (const cedula of cedulas) {
            await client.query('SELECT toggle_habilitado_usuario($1, $2)', [cedula, authResult.user.cedula]);
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/users');
        return { success: true, count: cedulas.length };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error cerrando semestre:', error);
        return { success: false, error: 'Error al cerrar semestre' };
    } finally {
        client.release();
    }
}

export async function deleteSemestre(term: string, motivo?: string) {
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
                SELECT 1 FROM coordinadores WHERE term = $1
                UNION
                SELECT 1 FROM estudiantes WHERE term = $1
                UNION
                SELECT 1 FROM profesores WHERE term = $1
            ) AS has_associations`,
            [term]
        );
        if (checkResult.rows[0]?.has_associations === true) {
            await client.query('ROLLBACK');
            return {
                success: false,
                error: 'HAS_ASSOCIATIONS',
                message: 'No se puede eliminar este semestre porque tiene usuarios (estudiantes, profesores o coordinadores) asociados.'
            };
        }

        await client.query("SELECT set_config('app.usuario_elimina_catalogo', $1, true)", [authResult.user.cedula]);
        await client.query("SELECT set_config('app.motivo_eliminacion_catalogo', $1, true)", [motivo || '']);

        const result = await client.query('DELETE FROM semestres WHERE term = $1 RETURNING *', [term]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, error: 'Semestre no encontrado' };
        }

        await client.query('COMMIT');
        revalidatePath('/dashboard/administration/semestres');
        return { success: true, data: result.rows[0] };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error deleting semestre:', error);
        return { success: false, error: 'Error al eliminar semestre' };
    } finally {
        client.release();
    }
}
