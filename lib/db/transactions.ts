import { PoolClient } from 'pg';
import { pool } from './pool';
import { logger } from '@/lib/utils/logger';

/**
 * Ejecuta una función dentro de una transacción
 * Si hay error, hace rollback automático
 * 
 * @param callback Función que recibe un PoolClient y retorna un Promise
 * @returns Resultado de la función callback
 * 
 * @example
 * const resultado = await withTransaction(async (client) => {
 *   await client.query('INSERT INTO tabla1...');
 *   await client.query('INSERT INTO tabla2...');
 *   return { success: true };
 * });
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error en transacción, rollback ejecutado', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Ejecuta múltiples queries en una transacción
 * 
 * @param queries Array de objetos con query y values opcionales
 * @returns Array con los resultados de cada query
 * 
 * @example
 * const results = await executeTransaction([
 *   { query: 'INSERT INTO tabla1 VALUES ($1)', values: ['valor1'] },
 *   { query: 'INSERT INTO tabla2 VALUES ($1)', values: ['valor2'] },
 * ]);
 */
export async function executeTransaction(
  queries: Array<{ query: string; values?: any[] }>
): Promise<any[]> {
  return withTransaction(async (client) => {
    const results = [];
    for (const { query, values } of queries) {
      const result = await client.query(query, values);
      results.push(result.rows);
    }
    return results;
  });
}

