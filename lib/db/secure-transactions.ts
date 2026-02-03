import { PoolClient } from 'pg';
import { pool } from './pool';
import { logger } from '@/lib/utils/logger';

// Roles de BD definidos en database/schemas/roles_permissions.sql
export type DbRole = 'rol_coordinador' | 'rol_profesor' | 'rol_estudiante';

/**
 * Mapea el rol de la aplicación (string) al rol de base de datos PostgreSQL
 */
export function mapAppRoleToDbRole(appRole: string): DbRole {
    const normalized = appRole?.trim();
    // Mapeo basado en los roles típicos de la app (vistos en role-mapper.ts)
    switch (normalized) {
        case 'Coordinador': return 'rol_coordinador';
        case 'Profesor': return 'rol_profesor';
        case 'Estudiante': return 'rol_estudiante';
        // Variaciones en minúscula por seguridad
        case 'coordinador': return 'rol_coordinador';
        case 'profesor': return 'rol_profesor';
        case 'estudiante': return 'rol_estudiante';
        default:
            // Fallback seguro: el rol con menos privilegios
            logger.warn(`Rol desconocido '${appRole}', usando 'rol_estudiante' por seguridad.`);
            return 'rol_estudiante';
    }
}

/**
 * Ejecuta una función dentro de una transacción con un rol de base de datos específico.
 * Utiliza SET LOCAL ROLE para que el cambio de permisos dure solo lo que dura la transacción.
 * 
 * Esto asegura que PostgreSQL aplique los permisos (GRANT/REVOKE) y políticas (RLS)
 * definidos para ese rol específico.
 * 
 * @param userRole El rol del usuario en la aplicación (ej: 'Coordinador')
 * @param callback Función que recibe el cliente de BD y retorna una promesa
 */
export async function withSecureTransaction<T>(
    userRole: string,
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await pool.connect();
    const dbRole = mapAppRoleToDbRole(userRole);

    try {
        await client.query('BEGIN');

        // Asumir el rol de BD solo para el ámbito de esta transacción
        await client.query(`SET LOCAL ROLE ${dbRole}`);
        // logger.debug(`Secure Tx iniciada: AppRole='${userRole}' -> DbRole='${dbRole}'`);

        const result = await callback(client);

        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Error en transacción segura (Rol: ${dbRole} ← ${userRole})`, error);
        throw error;
    } finally {
        client.release();
    }
}
