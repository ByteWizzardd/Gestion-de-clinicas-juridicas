
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load env vars helper
function loadEnv(filename) {
    try {
        const filePath = path.resolve(__dirname, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const idx = trimmed.indexOf('=');
                if (idx !== -1) {
                    const key = trimmed.substring(0, idx).trim();
                    let value = trimmed.substring(idx + 1).trim();
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
        }
    } catch (e) {
        console.error(`Error loading ${filename}:`, e);
    }
}

loadEnv('.env');
loadEnv('.env.local');

async function findCoordinator() {
    console.log("Connecting to database...");

    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL not found");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });

    try {
        const client = await pool.connect();
        try {
            console.log("Searching for coordinators...");
            const res = await client.query("SELECT cedula, nombre_usuario, tipo_usuario FROM usuarios WHERE tipo_usuario ILIKE '%coordinador%' LIMIT 5");
            if (res.rows.length > 0) {
                console.log("Found coordinators:");
                console.table(res.rows);
            } else {
                console.log("No coordinators found. Listing all users:");
                const allRes = await client.query("SELECT cedula, nombre_usuario, tipo_usuario FROM usuarios LIMIT 5");
                console.table(allRes.rows);
            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await pool.end();
    }
}

findCoordinator();
