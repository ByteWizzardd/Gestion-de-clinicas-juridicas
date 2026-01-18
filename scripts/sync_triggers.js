const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function syncTriggers() {
    let dbUrl = process.env.DATABASE_URL;

    // Try to load from .env if not in environment
    if (!dbUrl) {
        try {
            const envPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/DATABASE_URL=(.*)/);
                if (match) dbUrl = match[1].trim();
            }
        } catch (e) {
            console.error("Error reading .env", e);
        }
    }

    // Try .env.local
    if (!dbUrl) {
        try {
            const envPath = path.join(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const match = envContent.match(/DATABASE_URL=(.*)/);
                if (match) dbUrl = match[1].trim();
            }
        } catch (e) { console.error("Error reading .env.local", e); }
    }

    if (!dbUrl) {
        console.error("DATABASE_URL not found in .env or .env.local");
        process.exit(1);
    }

    // Clean quotes
    dbUrl = dbUrl.replace(/^["']|["']$/g, '');

    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        console.log("Connected to database...");

        console.log("Fetching functions...");
        // Fetch Functions (including our custom ones)
        // We filter by schema 'public' and common prefixes or known names
        const funcsQuery = `
            SELECT 
                p.proname as name,
                pg_get_functiondef(p.oid) as def
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND (
                p.proname LIKE 'trigger_%' 
                OR p.proname LIKE 'assign_%'
                OR p.proname LIKE 'audit_%'
            )
            ORDER BY p.proname;
        `;
        const funcsRes = await client.query(funcsQuery);

        console.log("Fetching triggers...");
        // Fetch Triggers definitions
        const triggersQuery = `
            SELECT 
                t.tgname as trigger_name,
                c.relname as table_name,
                pg_get_triggerdef(t.oid) as def
            FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public'
            AND t.tgisinternal = false
            ORDER BY c.relname, t.tgname;
        `;
        const triggersRes = await client.query(triggersQuery);

        console.log(`Found ${funcsRes.rows.length} functions and ${triggersRes.rows.length} triggers.`);

        let sqlContent = "-- =========================================================\n";
        sqlContent += "-- TRIGGERS Y FUNCIONES SINCRONIZADOS DE NEON\n";
        sqlContent += `-- Fecha de sincronización: ${new Date().toISOString()}\n`;
        sqlContent += "-- =========================================================\n\n";

        // Functions
        sqlContent += "-- =========================================================\n";
        sqlContent += "-- FUNCIONES\n";
        sqlContent += "-- =========================================================\n\n";

        for (const func of funcsRes.rows) {
            sqlContent += `-- Función: ${func.name}\n`;
            sqlContent += `${func.def};\n\n`;
        }

        // Triggers
        sqlContent += "-- =========================================================\n";
        sqlContent += "-- TRIGGERS\n";
        sqlContent += "-- =========================================================\n\n";

        let currentTable = '';
        for (const t of triggersRes.rows) {
            if (t.table_name !== currentTable) {
                currentTable = t.table_name;
                sqlContent += `-- Tabla: ${currentTable}\n`;
            }

            sqlContent += `DROP TRIGGER IF EXISTS ${t.trigger_name} ON ${t.table_name};\n`;
            sqlContent += `${t.def};\n\n`;
        }

        const outputPath = path.join(process.cwd(), 'database', 'schemas', 'triggers.sql');
        fs.writeFileSync(outputPath, sqlContent);

        console.log(`Successfully wrote to ${outputPath}`);

    } catch (e) {
        console.error("Error connecting or syncing:", e);
    } finally {
        await client.end();
    }
}

syncTriggers();
