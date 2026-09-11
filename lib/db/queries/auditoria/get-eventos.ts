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
        // Sesiones, reportes y descargas de soportes ya viven en auditoria_eventos
        // (entidad='sesion'|'reporte'|'soporte') — ya no hace falta el UNION ALL
        // contra sus tablas viejas.
        const query = `
            SELECT entidad, operacion, COUNT(*)::int as total, MAX(fecha_evento) as ultima_actividad
            FROM auditoria_eventos
            GROUP BY entidad, operacion
        `;
        const { pool } = await import('../../pool');
        const result = await pool.query(query);

        // Map DB rows → legacy AuditCounts shape
        const entidadOpMap: Record<string, number> = {};
        const lastActivities: Record<string, string | null> = {};

        for (const row of result.rows) {
            const key = `${row.entidad}:${row.operacion}`;
            entidadOpMap[key] = row.total;
            // Track last activity per module
            const moduleKey = row.entidad;
            const ts = row.ultima_actividad instanceof Date ? row.ultima_actividad.toISOString() : row.ultima_actividad;
            if (!lastActivities[moduleKey] || (ts && ts > (lastActivities[moduleKey] || ''))) {
                lastActivities[moduleKey] = ts;
            }
        }

        const g = (entidad: string, operacion: string) => entidadOpMap[`${entidad}:${operacion}`] || 0;

        // Map friendly module names for lastActivities
        const la: Record<string, string | null> = {
            soportes: lastActivities['soporte'] || null,
            reportes: lastActivities['reporte'] || null,
            citas: lastActivities['cita'] || null,
            usuarios: lastActivities['usuario'] || lastActivities['estudiante'] || lastActivities['profesor'] || null,
            casos: lastActivities['caso'] || null,
            solicitantes: lastActivities['solicitante'] || null,
            beneficiarios: lastActivities['beneficiario'] || null,
            acciones: lastActivities['accion_ejecutores'] || null,
            equipo: lastActivities['equipo'] || null,
            sesiones: lastActivities['sesion'] || null,
            estados: lastActivities['estado'] || null,
            materias: lastActivities['materia'] || null,
            nivelesEducativos: lastActivities['nivel_educativo'] || null,
            nucleos: lastActivities['nucleo'] || null,
            condicionesTrabajo: lastActivities['condicion_trabajo'] || null,
            condicionesActividad: lastActivities['condicion_actividad'] || null,
            tiposCaracteristicas: lastActivities['tipo_caracteristica'] || null,
            semestres: lastActivities['semestre'] || null,
            municipios: lastActivities['municipio'] || null,
            parroquias: lastActivities['parroquia'] || null,
            categorias: lastActivities['categoria'] || null,
            subcategorias: lastActivities['subcategoria'] || null,
            ambitosLegales: lastActivities['ambito_legal'] || null,
            caracteristicas: lastActivities['caracteristica'] || null,
        };

        return {
            soportes: g('soporte', 'eliminacion'),
            soportesCreados: g('soporte', 'insercion'),
            soportesDescargados: g('soporte', 'descarga_soporte'),
            reportesGenerados: g('reporte', 'generacion_reporte') + g('reporte', 'vista_previa_reporte'),
            citasEliminadas: g('cita', 'eliminacion'),
            citasActualizadas: g('cita', 'actualizacion'),
            citasCreadas: g('cita', 'insercion'),
            usuariosEliminados: g('usuario', 'eliminacion'),
            usuariosHabilitados: 0,
            usuariosActualizadosCampos: g('usuario', 'actualizacion'),
            usuariosCreados: g('usuario', 'insercion'),
            casosEliminados: g('caso', 'eliminacion'),
            casosActualizados: g('caso', 'actualizacion'),
            casosCreados: g('caso', 'insercion'),
            solicitantesEliminados: g('solicitante', 'eliminacion'),
            solicitantesActualizados: g('solicitante', 'actualizacion'),
            solicitantesCreados: g('solicitante', 'insercion'),
            estudiantesInscritos: g('estudiante', 'insercion'),
            profesoresAsignados: g('profesor', 'insercion'),
            beneficiariosCreados: g('beneficiario', 'insercion'),
            beneficiariosActualizados: g('beneficiario', 'actualizacion'),
            beneficiariosEliminados: g('beneficiario', 'eliminacion'),
            accionesCreadas: g('accion_ejecutores', 'insercion'),
            accionesActualizadas: g('accion_ejecutores', 'actualizacion'),
            accionesEliminadas: g('accion_ejecutores', 'eliminacion'),
            equiposActualizados: g('equipo', 'actualizacion'),
            sesiones: g('sesion', 'inicio_sesion') + g('sesion', 'cierre_sesion') + g('sesion', 'intento_fallido'),
            // Catálogos
            estadosEliminados: g('estado', 'eliminacion') || undefined,
            estadosActualizados: g('estado', 'actualizacion') || undefined,
            estadosInsertados: g('estado', 'insercion') || undefined,
            materiasEliminadas: g('materia', 'eliminacion') || undefined,
            materiasActualizadas: g('materia', 'actualizacion') || undefined,
            materiasInsertadas: g('materia', 'insercion') || undefined,
            nivelesEducativosEliminados: g('nivel_educativo', 'eliminacion') || undefined,
            nivelesEducativosActualizados: g('nivel_educativo', 'actualizacion') || undefined,
            nivelesEducativosInsertados: g('nivel_educativo', 'insercion') || undefined,
            nucleosEliminados: g('nucleo', 'eliminacion') || undefined,
            nucleosActualizados: g('nucleo', 'actualizacion') || undefined,
            nucleosInsertados: g('nucleo', 'insercion') || undefined,
            condicionesTrabajoEliminadas: g('condicion_trabajo', 'eliminacion') || undefined,
            condicionesTrabajoActualizadas: g('condicion_trabajo', 'actualizacion') || undefined,
            condicionesTrabajoInsertadas: g('condicion_trabajo', 'insercion') || undefined,
            condicionesActividadEliminadas: g('condicion_actividad', 'eliminacion') || undefined,
            condicionesActividadActualizadas: g('condicion_actividad', 'actualizacion') || undefined,
            condicionesActividadInsertadas: g('condicion_actividad', 'insercion') || undefined,
            tiposCaracteristicasEliminados: g('tipo_caracteristica', 'eliminacion') || undefined,
            tiposCaracteristicasActualizados: g('tipo_caracteristica', 'actualizacion') || undefined,
            tiposCaracteristicasInsertados: g('tipo_caracteristica', 'insercion') || undefined,
            semestresEliminados: g('semestre', 'eliminacion') || undefined,
            semestresActualizados: g('semestre', 'actualizacion') || undefined,
            semestresInsertados: g('semestre', 'insercion') || undefined,
            municipiosEliminados: g('municipio', 'eliminacion') || undefined,
            municipiosActualizados: g('municipio', 'actualizacion') || undefined,
            municipiosInsertados: g('municipio', 'insercion') || undefined,
            parroquiasEliminadas: g('parroquia', 'eliminacion') || undefined,
            parroquiasActualizadas: g('parroquia', 'actualizacion') || undefined,
            parroquiasInsertadas: g('parroquia', 'insercion') || undefined,
            categoriasEliminadas: g('categoria', 'eliminacion') || undefined,
            categoriasActualizadas: g('categoria', 'actualizacion') || undefined,
            categoriasInsertadas: g('categoria', 'insercion') || undefined,
            subcategoriasEliminadas: g('subcategoria', 'eliminacion') || undefined,
            subcategoriasActualizadas: g('subcategoria', 'actualizacion') || undefined,
            subcategoriasInsertadas: g('subcategoria', 'insercion') || undefined,
            ambitosLegalesEliminados: g('ambito_legal', 'eliminacion') || undefined,
            ambitosLegalesActualizados: g('ambito_legal', 'actualizacion') || undefined,
            ambitosLegalesInsertados: g('ambito_legal', 'insercion') || undefined,
            caracteristicasEliminadas: g('caracteristica', 'eliminacion') || undefined,
            caracteristicasActualizadas: g('caracteristica', 'actualizacion') || undefined,
            caracteristicasInsertadas: g('caracteristica', 'insercion') || undefined,
            lastActivities: la,
        };
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
