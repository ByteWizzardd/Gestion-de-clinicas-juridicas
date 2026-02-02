import { Pool, PoolConfig } from 'pg';
import { logger } from '@/lib/utils/logger';

// Conección y gestion de archivos SQL

const rawConnectionString = process.env.DATABASE_URL?.trim();

/**
 * Configuración del pool de conexiones PostgreSQL
 */
if (!rawConnectionString) {
  logger.error('DATABASE_URL no está configurada en las variables de entorno');
}

const config: PoolConfig = {
  connectionString: rawConnectionString,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 60000, // Timeout para establecer conexión (60s - necesario para Neon que puede estar "dormido")
  statement_timeout: 30000, // Timeout para queries (30 segundos)
  query_timeout: 30000, // Timeout para queries (30 segundos)
  // Configuración adicional para Neon
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
};

// Crear el pool de conexiones usando singleton para evitar múltiples conexiones en desarrollo
const globalForPool = global as unknown as { pool: Pool };

export const pool = globalForPool.pool || new Pool(config);

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}

// Manejo de errores del pool
pool.on('error', (err: Error) => {
  logger.error('Error inesperado en el pool de PostgreSQL', err);
});

/**
 * Verifica la conexión a la base de datos
 * @returns Objeto con el estado de la conexión
 */
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    return {
      connected: true,
      timestamp: result.rows[0].now,
      version: result.rows[0].version,
    };
  } catch (error) {
    logger.error('Error de conexión a la base de datos', error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Cierra todas las conexiones del pool
 * Útil para shutdown graceful
 */
export async function closePool() {
  await pool.end();
  logger.info('Pool de conexiones cerrado');
}

