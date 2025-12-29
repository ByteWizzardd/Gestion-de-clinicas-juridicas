'use server';
import { pool } from '@/lib/db/pool';

export async function debugDates() {
    try {
        const res = await pool.query(`
      SELECT 
        COUNT(*) as total, 
        COUNT(fecha_solicitud) as with_solicitud, 
        COUNT(fecha_inicio_caso) as with_inicio 
      FROM casos
    `);

        const semestres = await pool.query('SELECT term, fecha_inicio, fecha_fin FROM semestres');

        return {
            counts: res.rows[0],
            semestres: semestres.rows.map(s => ({
                term: s.term,
                start: s.fecha_inicio.toISOString(),
                end: s.fecha_fin.toISOString()
            }))
        };
    } catch (err) {
        return { error: err instanceof Error ? err.message : 'Error' };
    }
}
