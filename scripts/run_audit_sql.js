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

const sql = `
DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Eliminar FK especifica de insercion (si existe)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'auditoria_insercion_usuarios_cedula_fkey') THEN
        EXECUTE 'ALTER TABLE auditoria_insercion_usuarios DROP CONSTRAINT auditoria_insercion_usuarios_cedula_fkey';
        RAISE NOTICE 'Eliminada constraint auditoria_insercion_usuarios_cedula_fkey';
    ELSE
        RAISE NOTICE 'No se encontró auditoria_insercion_usuarios_cedula_fkey, buscando generica...';
        FOR r IN SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'auditoria_insercion_usuarios' AND constraint_type = 'FOREIGN KEY' AND constraint_name LIKE '%cedula%' LOOP
            EXECUTE 'ALTER TABLE auditoria_insercion_usuarios DROP CONSTRAINT ' || quote_ident(r.constraint_name);
            RAISE NOTICE 'Eliminada constraint generica %', r.constraint_name;
        END LOOP;
    END IF;

    -- 2. Eliminar FK de actualizacion (ci_usuario)
    FOR r IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'auditoria_actualizacion_usuarios' 
        AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%ci_usuario%' 
    LOOP
        EXECUTE 'ALTER TABLE auditoria_actualizacion_usuarios DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Eliminada constraint % de actualizacion', r.constraint_name;
    END LOOP;
END $$;
`;

pool.query(sql)
    .then(() => console.log('Operación completada.'))
    .catch(e => console.error('Error:', e))
    .finally(() => pool.end());
