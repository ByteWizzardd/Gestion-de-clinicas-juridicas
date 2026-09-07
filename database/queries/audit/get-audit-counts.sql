WITH eventos_agrupados AS (
    SELECT 
        entidad, 
        operacion, 
        COUNT(*) as total 
    FROM auditoria_eventos 
    GROUP BY entidad, operacion
),
soportes_descargados AS (
    SELECT COUNT(*) as total FROM auditoria_descarga_soportes
),
sesiones AS (
    SELECT COUNT(*) as total FROM auditoria_sesiones
),
reportes AS (
    SELECT COUNT(*) as total FROM auditoria_reportes
)
SELECT 
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'soporte' AND operacion = 'eliminacion') as "soportes",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'soporte' AND operacion = 'insercion') as "soportesCreados",
    (SELECT total FROM soportes_descargados) as "soportesDescargados",
    
    (SELECT total FROM reportes) as "reportesGenerados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'eliminacion') as "citasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'actualizacion') as "citasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'insercion') as "citasCreadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'eliminacion') as "usuariosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'actualizacion') as "usuariosActualizadosCampos",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'insercion') as "usuariosCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'eliminacion') as "estadosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'actualizacion') as "estadosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'insercion') as "estadosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'eliminacion') as "materiasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'actualizacion') as "materiasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'insercion') as "materiasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'eliminacion') as "nivelesEducativosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'actualizacion') as "nivelesEducativosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'insercion') as "nivelesEducativosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'eliminacion') as "nucleosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'actualizacion') as "nucleosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'insercion') as "nucleosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'eliminacion') as "condicionesTrabajoEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'actualizacion') as "condicionesTrabajoActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'insercion') as "condicionesTrabajoInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'eliminacion') as "condicionesActividadEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'actualizacion') as "condicionesActividadActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'insercion') as "condicionesActividadInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'eliminacion') as "tiposCaracteristicasEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'actualizacion') as "tiposCaracteristicasActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'insercion') as "tiposCaracteristicasInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'eliminacion') as "semestresEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'actualizacion') as "semestresActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'insercion') as "semestresInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'eliminacion') as "municipiosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'actualizacion') as "municipiosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'insercion') as "municipiosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'eliminacion') as "parroquiasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'actualizacion') as "parroquiasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'insercion') as "parroquiasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'eliminacion') as "categoriasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'actualizacion') as "categoriasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'insercion') as "categoriasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'eliminacion') as "subcategoriasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'actualizacion') as "subcategoriasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'insercion') as "subcategoriasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'eliminacion') as "ambitosLegalesEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'actualizacion') as "ambitosLegalesActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'insercion') as "ambitosLegalesInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'eliminacion') as "caracteristicasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'actualizacion') as "caracteristicasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'insercion') as "caracteristicasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'eliminacion') as "casosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'actualizacion') as "casosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'insercion') as "casosCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'eliminacion') as "solicitantesEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'actualizacion') as "solicitantesActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'insercion') as "solicitantesCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'estudiante%' AND operacion = 'insercion') as "estudiantesInscritos",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'profesor%' AND operacion = 'insercion') as "profesoresAsignados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'insercion') as "beneficiariosCreados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'actualizacion') as "beneficiariosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'eliminacion') as "beneficiariosEliminados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'insercion') as "accionesCreadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'actualizacion') as "accionesActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'eliminacion') as "accionesEliminadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'equipo%' AND operacion = 'actualizacion') as "equiposActualizados",
    
    (SELECT total FROM sesiones) as "sesiones";
