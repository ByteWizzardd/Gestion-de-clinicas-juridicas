
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

async function runMigration() {
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
        const sqlPath = path.join(__dirname, 'database', 'migrations', 'fix-municipio-audit-trigger-v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log("Executing fix-municipio-audit-trigger-v2.sql...");
        const client = await pool.connect();
        try {
            await client.query(sql);
            console.log("SUCCESS: Trigger updated (Using Coordinator fallback).");
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
