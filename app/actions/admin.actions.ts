'use server';

import { pool } from '@/lib/db/pool';
import { logger } from '@/lib/utils/logger';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function fixDatabaseSequences() {
    // Mantenimiento de base de datos: solo coordinadores.
    const authResult = await requireAuthInServerActionWithCode();
    if (!authResult.success || !authResult.user) {
        return { success: false, error: 'No autorizado' };
    }
    if (authResult.user.rol !== 'Coordinador') {
        return { success: false, error: 'No autorizado' };
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const migrationPath = join(process.cwd(), 'database', 'migrations', 'fix-all-sequences.sql');
        const query = readFileSync(migrationPath, 'utf-8');

        // Execute the anonymous code block
        await client.query(query);

        await client.query('COMMIT');
        return { success: true, message: 'Todas las secuencias han sido corregidas.' };
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error fixing sequences:', error);
        return { success: false, error: 'Error al corregir secuencias' };
    } finally {
        client.release();
    }
}
