import { pool } from './lib/db/pool';

async function checkData() {
    try {
        const res = await pool.query(`
      SELECT 
        COUNT(*) as total, 
        COUNT(fecha_solicitud) as with_solicitud, 
        COUNT(fecha_inicio_caso) as with_inicio 
      FROM casos
    `);
        console.log('Case counts:', res.rows[0]);

        const sample = await pool.query('SELECT fecha_solicitud, fecha_inicio_caso FROM casos LIMIT 5');
        console.log('Sample dates:', sample.rows);

        const semestres = await pool.query('SELECT term, fecha_inicio, fecha_fin FROM semestres');
        console.log('Semestres:', semestres.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
