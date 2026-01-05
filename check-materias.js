// Simple script to check materias in database
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkMaterias() {
    try {
        console.log('Conectando a la base de datos...');
        const result = await pool.query('SELECT * FROM materias ORDER BY id_materia DESC LIMIT 10');
        console.log('\n📋 Últimas 10 materias en la base de datos:');
        console.table(result.rows);
        console.log(`\nTotal de materias encontradas: ${result.rowCount}`);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkMaterias();
