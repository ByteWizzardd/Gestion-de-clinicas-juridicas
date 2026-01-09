
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load env vars helper
function loadEnv(filename) {
    try {
        const filePath = path.resolve(__dirname, filename);
        if (fs.existsSync(filePath)) {
            console.log(`Loading ${filename}...`);
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
                // Simple parser: KEY=VALUE, supports comments #
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;

                const idx = trimmed.indexOf('=');
                if (idx !== -1) {
                    const key = trimmed.substring(0, idx).trim();
                    let value = trimmed.substring(idx + 1).trim();
                    // Remove quotes if present
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

// Load envs
loadEnv('.env');
loadEnv('.env.local');

async function runFixed() {
    console.log("Connecting to database...");

    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL not found in .env or .env.local");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });

    try {
        const sqlPath = path.join(__dirname, 'database', 'migrations', 'fix-all-sequences.sql');
        if (!fs.existsSync(sqlPath)) {
            console.error(`SQL file not found at ${sqlPath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log("Executing fix-all-sequences.sql...");
        const client = await pool.connect();
        try {
            // Because our SQL block has RAISE NOTICE, we can listen to it
            client.on('notice', (msg) => console.log('NOTICE:', msg.message));

            await client.query(sql);
            console.log("SUCCESS: All sequences have been synchronized.");
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("ERROR executing script:", err);
    } finally {
        await pool.end();
    }
}

runFixed();
