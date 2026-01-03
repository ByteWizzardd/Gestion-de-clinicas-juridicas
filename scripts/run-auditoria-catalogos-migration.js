import { pool } from '../lib/db/pool.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Ejecutando migración: add-auditoria-catalogos.sql');
    
    const migrationPath = join(__dirname, '..', 'database', 'migrations', 'add-auditoria-catalogos.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migración de tablas de auditoría de catálogos ejecutada exitosamente');
    
    console.log('Ejecutando migración: add-triggers-auditoria-catalogos.sql');
    
    const triggersPath = join(__dirname, '..', 'database', 'migrations', 'add-triggers-auditoria-catalogos.sql');
    const triggersSQL = readFileSync(triggersPath, 'utf-8');
    
    await client.query('BEGIN');
    await client.query(triggersSQL);
    await client.query('COMMIT');
    
    console.log('✅ Migración de triggers de auditoría de catálogos ejecutada exitosamente');
    console.log('✅ Todas las tablas y triggers de auditoría de catálogos creados');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al ejecutar migración:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigration();
