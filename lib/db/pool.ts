import { Pool, PoolConfig } from 'pg';
import { logger } from '@/lib/utils/logger';

/**
 * Configuración del pool de conexiones PostgreSQL
 */
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
};

// Crear el pool de conexiones
export const pool = new Pool(config);

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

