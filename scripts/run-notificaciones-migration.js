import { pool } from '../lib/db/pool.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('Ejecutando migración: create-notificaciones.sql');
    
    const migrationPath = join(__dirname, '..', 'database', 'migrations', 'create-notificaciones.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    console.log('✅ Tabla notificaciones creada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
