import { auditoriaEventosQueries } from '../auditoria-eventos.queries';
import type { AuditoriaEventoFilters, AuditoriaEventosPage } from '@/types/audit-events';
import { logger } from '@/lib/utils/logger';

/**
 * @deprecated Usa auditoriaEventosQueries desde '@/lib/db/queries/auditoria-eventos.queries' directamente.
 */
export const auditoriaQueries = {
    /**
     * @deprecated Usa auditoriaEventosQueries.getEventos()
     */
    getEventos: async (filters?: AuditoriaEventoFilters): Promise<AuditoriaEventosPage> => {
        logger.warn('Uso obsoleto de auditoriaQueries.getEventos. Usa auditoriaEventosQueries en su lugar.');
        return auditoriaEventosQueries.getEventos(filters);
    },

    /**
     * @deprecated Usa auditoriaEventosQueries.getResumenPorEntidad()
     */
    getAuditCounts: async (): Promise<any> => {
        logger.warn('Uso obsoleto de auditoriaQueries.getAuditCounts. Usa auditoriaEventosQueries.getResumenPorEntidad() en su lugar.');
        // Para compatibilidad regresiva, devuelvo un dummy que no rompa la UI legacy
        // hasta que se borren las acciones legacy
        return { lastActivities: {} };
    },
    
    /**
     * Alias por retrocompatibilidad de getAllEventos 
     */
    getAllEventos: async (limit: number, offset: number = 0, filters: any = {}): Promise<any[]> => {
        logger.warn('Uso obsoleto de auditoriaQueries.getAllEventos.');
        const result = await auditoriaEventosQueries.getEventos({
            limit,
            offset,
            ...filters
        });
        return result.eventos;
    },
    
    countEventos: async (filters: any = {}): Promise<number> => {
        const result = await auditoriaEventosQueries.getEventos({ limit: 1, ...filters });
        return result.total;
    }
};
