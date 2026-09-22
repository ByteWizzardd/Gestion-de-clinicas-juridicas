'use server';

/**
 * Pestaña "Mantenimiento" del panel de Auditoría: política de retención y
 * purga manual de `auditoria_eventos`.
 *
 * La purga NUNCA se dispara sola. El único camino es: el chequeo deja una
 * notificación al Coordinador (lib/services/audit-retention.service.ts), la
 * notificación lleva a /dashboard/audit?purgeLogs=true, y ahí el Coordinador
 * revisa la vista previa y confirma — igual que el archivado de casos
 * inactivos.
 */

import {
    auditoriaRetencionQueries,
    type ClaseRetencion,
    type ResultadoPurga,
    type UltimaPurga,
} from '@/lib/db/queries/auditoria-retencion.queries';
import { requireAuthInServerActionWithCode } from '@/lib/utils/server-auth';
import { mapSystemRoleToSidebarRole } from '@/lib/utils/role-mapper';
import { toUserMessage } from '@/lib/utils/error-messages';
import { logger } from '@/lib/utils/logger';

export interface RetencionResult<T> {
    success: boolean;
    data?: T;
    error?: { message: string; code?: string };
}

async function requireCoordinador() {
    const authResult = await requireAuthInServerActionWithCode();
    if (
        !authResult.success ||
        !authResult.user ||
        mapSystemRoleToSidebarRole(authResult.user.rol) !== 'coordinator'
    ) {
        throw new Error('No autorizado para depurar la auditoría');
    }
    return authResult.user;
}

/** Política de retención + cuántos eventos de cada clase ya vencieron. */
export async function getRetencionAuditoriaAction(): Promise<RetencionResult<ClaseRetencion[]>> {
    try {
        await requireCoordinador();
        return { success: true, data: await auditoriaRetencionQueries.getResumen() };
    } catch (error) {
        logger.error('Error en getRetencionAuditoriaAction', error);
        return {
            success: false,
            error: { message: toUserMessage(error, 'Error al obtener la política de retención') },
        };
    }
}

/** Cambia el plazo sugerido de una clase. */
export async function updateRetencionAuditoriaAction(
    clase: string,
    meses: number
): Promise<RetencionResult<ClaseRetencion[]>> {
    try {
        const user = await requireCoordinador();

        if (!Number.isInteger(meses) || meses < 1 || meses > 600) {
            return {
                success: false,
                error: { message: 'El plazo debe ser un número entero de meses entre 1 y 600' },
            };
        }

        // El piso de cada clase lo defiende también el CHECK de la tabla; aquí
        // se comprueba antes para poder decir POR QUÉ no se puede bajar.
        const actual = await auditoriaRetencionQueries.getResumen();
        const fila = actual.find((c) => c.clase === clase);
        if (!fila) {
            return { success: false, error: { message: 'Esa clase de registros no existe' } };
        }
        if (meses < fila.meses_minimo) {
            return {
                success: false,
                error: {
                    message: `"${fila.etiqueta}" no puede guardarse por menos de ${fila.meses_minimo} meses.`,
                },
            };
        }

        await auditoriaRetencionQueries.updateMeses(clase, meses, user.cedula);
        return { success: true, data: await auditoriaRetencionQueries.getResumen() };
    } catch (error) {
        logger.error('Error en updateRetencionAuditoriaAction', error);
        return {
            success: false,
            error: { message: toUserMessage(error, 'Error al actualizar el plazo de retención') },
        };
    }
}

/** Vista previa: cuenta lo que se borraría, sin borrar nada. */
export async function simularPurgaAuditoriaAction(
    clases: string[]
): Promise<RetencionResult<ResultadoPurga[]>> {
    try {
        const user = await requireCoordinador();
        if (!Array.isArray(clases) || clases.length === 0) {
            return { success: false, error: { message: 'Selecciona al menos un tipo de registro' } };
        }
        return { success: true, data: await auditoriaRetencionQueries.purgar(clases, user.cedula, true) };
    } catch (error) {
        logger.error('Error en simularPurgaAuditoriaAction', error);
        return {
            success: false,
            error: { message: toUserMessage(error, 'Error al calcular la depuración') },
        };
    }
}

/** La purga de verdad. Solo se llega aquí desde la confirmación del modal. */
export async function purgarAuditoriaAction(
    clases: string[]
): Promise<RetencionResult<{ resultados: ResultadoPurga[]; total: number; retenidos: number }>> {
    try {
        const user = await requireCoordinador();
        if (!Array.isArray(clases) || clases.length === 0) {
            return { success: false, error: { message: 'Selecciona al menos un tipo de registro' } };
        }

        const resultados = await auditoriaRetencionQueries.purgar(clases, user.cedula, false);
        const total = resultados.reduce((suma, r) => suma + r.eventos_borrados, 0);
        const retenidos = resultados.reduce((suma, r) => suma + r.eventos_retenidos, 0);

        logger.info(
            `Purga de auditoría por ${user.cedula}: ${total} eventos borrados (${clases.join(', ')})`
        );

        return { success: true, data: { resultados, total, retenidos } };
    } catch (error) {
        logger.error('Error en purgarAuditoriaAction', error);
        return {
            success: false,
            error: { message: toUserMessage(error, 'Error al depurar los registros de auditoría') },
        };
    }
}

/** Última purga hecha, para mostrarla en la pestaña. */
export async function getUltimaPurgaAuditoriaAction(): Promise<RetencionResult<UltimaPurga | null>> {
    try {
        await requireCoordinador();
        return { success: true, data: await auditoriaRetencionQueries.getUltimaPurga() };
    } catch (error) {
        logger.error('Error en getUltimaPurgaAuditoriaAction', error);
        return { success: false, error: { message: toUserMessage(error, 'Error al obtener la última depuración') } };
    }
}
