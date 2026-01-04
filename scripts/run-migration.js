import { pool } from '../lib/db/pool';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  try {
    console.log('Ejecutando migración: add-password-to-usuarios.sql');
    
    const migrationPath = join(__dirname, '..', 'database', 'migrations', 'add-password-to-usuarios.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await pool.query(migrationSQL);
    
    console.log('✅ Migración ejecutada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error.message);
    process.exit(1);
  }
}

runMigration();

