import type { PoolClient } from 'pg';
import type { AuditMetadata } from '@/types/audit-events';
import { pool } from '@/lib/db/pool';
import { randomUUID } from 'crypto';

/**
 * LA ÚNICA forma de abrir una transacción de escritura en el sistema.
 * Fuerza el enriquecimiento de auditoría como condición de entrada — no se puede
 * obtener un PoolClient transaccional sin proporcionar el usuario y la acción.
 *
 * - El tx_id se genera aquí y se comparte con todos los triggers de la transacción.
 * - En COMMIT o ROLLBACK, PostgreSQL limpia automáticamente las variables SET LOCAL.
 *
 * @example
 * const resultado = await withAuditTransaction(
 *   userId,
 *   { accion_negocio: 'Cierre de Caso', motivo: params.motivo },
 *   async (client) => {
 *     await client.query('UPDATE casos SET estado = $1 WHERE id = $2', ['cerrado', id]);
 *     await client.query('INSERT INTO equipo ...', [...]);
 *     return { ok: true };
 *   }
 * );
 */
export async function withAuditTransaction<T>(
  idUsuario: string,
  metadata: Omit<AuditMetadata, 'tx_id'>, // accion_negocio es REQUERIDA aquí
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  const txId = randomUUID();
  try {
    await client.query('BEGIN');
    // Inyección atómica: usuario + contexto de negocio + tx_id de agrupación
    await Promise.all([
      client.query("SELECT set_config('app.current_user_id', $1, true)", [idUsuario]),
      client.query("SELECT set_config('app.audit_metadata', $1, true)", [
        JSON.stringify({ ...metadata, tx_id: txId }),
      ]),
    ]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK'); // Si falla, ningún evento queda huérfano
    throw error;
  } finally {
    client.release();
  }
}
