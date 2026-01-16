const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    const migrationFile = process.argv[2];
    if (!migrationFile) {
        console.error('Por favor especifique el archivo de migración como argumento');
        process.exit(1);
    }

    try {
        const migrationPath = path.resolve(__dirname, migrationFile);
        console.log(`Leyendo migración de: ${migrationPath}`);

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`El archivo no existe: ${migrationPath}`);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Ejecutando SQL...');
        await pool.query(sql);

        console.log('✅ Migración ejecutada exitosamente');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
