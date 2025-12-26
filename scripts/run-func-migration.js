const { Pool } = require('pg');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

// Cargar variables de entorno manualmente
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  }
}

loadEnv();

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Ejecutando migración: func_obtener_siguiente_num_cita.sql');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está configurada en las variables de entorno');
    }
    
    const migrationPath = join(__dirname, '..', 'database', 'migrations', 'func_obtener_siguiente_num_cita.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('✅ Función obtener_siguiente_num_cita creada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error.message);
    if (error.detail) {
      console.error('Detalle:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

