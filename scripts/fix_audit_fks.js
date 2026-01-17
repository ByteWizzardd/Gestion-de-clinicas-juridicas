const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^([^=:#]+?)[=:](.*)/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
                if (!process.env[key]) process.env[key] = value;
            }
        });
    }
}

loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no definida.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function run() {
    try {
        console.log('Buscando tablas de auditoría de usuarios...');

        // 1. Identificar tablas de auditoría de usuarios
        const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'auditoria_%usuario%'
    `);

        const tables = tablesRes.rows.map(r => r.table_name);
        console.log('Tablas encontradas:', tables);

        for (const table of tables) {
            // 2. Buscar FKs a usuarios que NO sean del ejecutor (actor)
            // Asumimos que las columnas del ejecutor suelen tener 'por', 'creo', 'actualizo', 'elimino' en el nombre
            const fksRes = await pool.query(`
        SELECT tc.constraint_name, kcu.column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = $1
          AND ccu.table_name = 'usuarios'
      `, [table]);

            for (const fk of fksRes.rows) {
                const col = fk.column_name;

                // Criterio heurístico: Si la columna es el sujeto (ej: ci_usuario) la borramos.
                // Si es el actor (ej: id_usuario_actualizo), la dejamos.
                const isActor = col.includes('actualizo') || col.includes('creo') || col.includes('elimino') || col.includes('por');

                if (!isActor) {
                    console.log(`Eliminando FK '${fk.constraint_name}' en columna '${col}' de tabla '${table}'...`);
                    await pool.query(`ALTER TABLE "${table}" DROP CONSTRAINT "${fk.constraint_name}"`);
                    console.log('Eliminada.');
                } else {
                    console.log(`Conservando FK '${fk.constraint_name}' en columna '${col}' (parece ser actor).`);
                }
            }
        }

        console.log('Proceso finalizado.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
