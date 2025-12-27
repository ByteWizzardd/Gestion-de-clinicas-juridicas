'use server';

import { pool } from '@/lib/db/pool';

export async function verifyMaterias() {
    try {
        const result = await pool.query('SELECT * FROM materias ORDER BY id_materia DESC LIMIT 10');
        console.log('\n📋 Últimas 10 materias en la base de datos:');
        console.table(result.rows);
        return { success: true, data: result.rows, count: result.rowCount };
    } catch (error) {
        console.error('❌ Error verificando materias:', error);
        return { success: false, error: 'Error al verificar materias' };
    }
}
