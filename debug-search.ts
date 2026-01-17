
import { pool } from '@/lib/db/pool';

async function main() {
    try {
        const res = await pool.query(`
      SELECT id, num_accion, id_caso, detalle_accion, comentario 
      FROM auditoria_insercion_acciones 
      ORDER BY fecha_creacion DESC 
      LIMIT 5
    `);
        console.log('Recent Actions:', JSON.stringify(res.rows, null, 2));

        // Test unaccent
        try {
            const unaccentTest = await pool.query(`SELECT unaccent('Acción') as test`);
            console.log('Unaccent test:', unaccentTest.rows[0]);
        } catch (e) {
            console.log('Unaccent failed:', (e as Error).message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

main();
