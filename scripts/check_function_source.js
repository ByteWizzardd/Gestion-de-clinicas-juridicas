const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Función para cargar variables de entorno manualmente desde archivo
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
        const query = "SELECT prosrc FROM pg_proc WHERE proname = 'toggle_habilitado_usuario'";
        const res = await pool.query(query);
        if (res.rows.length > 0) {
            console.log('--- CODIGO FUENTE EN BD ---');
            console.log(res.rows[0].prosrc);
            console.log('--- FIN ---');

            if (res.rows[0].prosrc.includes('auditoria_actualizacion_usuarios')) {
                console.log('VERIFICACION: LA FUNCION TIENE "auditoria_actualizacion_usuarios". ESTÁ ACTUALIZADA.');
            } else {
                console.log('VERIFICACION: FALLO. LA FUNCION NO TIENE EL CAMBIO.');
            }
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
