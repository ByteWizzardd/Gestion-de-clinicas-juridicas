const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Función para cargar variables de entorno manualmente desde archivo
function loadEnv(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`Cargando entorno desde ${filePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
            // Ignorar comentarios y líneas vacías
            if (!line || line.startsWith('#')) return;

            const match = line.match(/^([^=:#]+?)[=:](.*)/);
            if (match) {
                const key = match[1].trim();
                // Quitar comillas si existen
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
    }
}

// Intentar cargar .env.local y .env
loadEnv(path.join(process.cwd(), '.env.local'));
loadEnv(path.join(process.cwd(), '.env'));

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL no está definida. Asegúrate de tener un archivo .env o .env.local con la conexión.');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function run() {
    try {
        const files = [
            'database/queries/usuarios/delete-user.sql',
            'database/queries/usuarios/update-habilitado.sql'
        ];

        for (const file of files) {
            const sqlPath = path.join(process.cwd(), file);
            if (fs.existsSync(sqlPath)) {
                console.log(`Leyendo ${file}...`);
                const sql = fs.readFileSync(sqlPath, 'utf8');
                console.log(`Ejecutando SQL de ${file}...`);
                await pool.query(sql);
                console.log(`${file} aplicado correctamente.`);
            } else {
                console.error(`Archivo no encontrado: ${file}`);
            }
        }
        console.log('Todas las actualizaciones de base de datos se completaron con éxito.');
    } catch (err) {
        console.error('Error ejecutando SQL:', err);
    } finally {
        await pool.end();
    }
}

run();
