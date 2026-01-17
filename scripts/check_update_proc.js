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
                process.env[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
            }
        });
    }
}
loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function run() {
    try {
        const res = await pool.query("SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'update_all_by_cedula'");
        if (res.rows.length > 0) {
            console.log(res.rows[0].pg_get_functiondef);
        } else {
            console.log('Funcion no encontrada.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
