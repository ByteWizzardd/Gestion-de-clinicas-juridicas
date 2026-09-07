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
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'soporte' AND operacion = 'DELETE') as "soportes",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'soporte' AND operacion = 'INSERT') as "soportesCreados",
    (SELECT total FROM soportes_descargados) as "soportesDescargados",
    
    (SELECT total FROM reportes) as "reportesGenerados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'DELETE') as "citasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'UPDATE') as "citasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'cita' AND operacion = 'INSERT') as "citasCreadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'DELETE') as "usuariosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'UPDATE') as "usuariosActualizadosCampos",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'usuario' AND operacion = 'INSERT') as "usuariosCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'DELETE') as "estadosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'UPDATE') as "estadosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'estado' OR entidad ILIKE 'estados') AND operacion = 'INSERT') as "estadosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'DELETE') as "materiasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'UPDATE') as "materiasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'materia' OR entidad ILIKE 'materias') AND operacion = 'INSERT') as "materiasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'DELETE') as "nivelesEducativosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'UPDATE') as "nivelesEducativosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE '%nivel_educativo%' AND operacion = 'INSERT') as "nivelesEducativosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'DELETE') as "nucleosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'UPDATE') as "nucleosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'nucleo%' AND operacion = 'INSERT') as "nucleosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'DELETE') as "condicionesTrabajoEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'UPDATE') as "condicionesTrabajoActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_trabajo' AND operacion = 'INSERT') as "condicionesTrabajoInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'DELETE') as "condicionesActividadEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'UPDATE') as "condicionesActividadActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'condicion_actividad' AND operacion = 'INSERT') as "condicionesActividadInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'DELETE') as "tiposCaracteristicasEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'UPDATE') as "tiposCaracteristicasActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'tipo_caracteristica' AND operacion = 'INSERT') as "tiposCaracteristicasInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'DELETE') as "semestresEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'UPDATE') as "semestresActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'semestre%' AND operacion = 'INSERT') as "semestresInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'DELETE') as "municipiosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'UPDATE') as "municipiosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'municipio%' AND operacion = 'INSERT') as "municipiosInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'DELETE') as "parroquiasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'UPDATE') as "parroquiasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'parroquia%' AND operacion = 'INSERT') as "parroquiasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'DELETE') as "categoriasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'UPDATE') as "categoriasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'categoria%' AND operacion = 'INSERT') as "categoriasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'DELETE') as "subcategoriasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'UPDATE') as "subcategoriasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'subcategoria%' AND operacion = 'INSERT') as "subcategoriasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'DELETE') as "ambitosLegalesEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'UPDATE') as "ambitosLegalesActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'ambito_legal' AND operacion = 'INSERT') as "ambitosLegalesInsertados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'DELETE') as "caracteristicasEliminadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'UPDATE') as "caracteristicasActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'caracteristica' OR entidad = 'caracteristicas') AND operacion = 'INSERT') as "caracteristicasInsertadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'DELETE') as "casosEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'UPDATE') as "casosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'caso%' AND operacion = 'INSERT') as "casosCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'DELETE') as "solicitantesEliminados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'UPDATE') as "solicitantesActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'solicitante%' AND operacion = 'INSERT') as "solicitantesCreados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'estudiante%' AND operacion = 'INSERT') as "estudiantesInscritos",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'profesor%' AND operacion = 'INSERT') as "profesoresAsignados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'INSERT') as "beneficiariosCreados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'UPDATE') as "beneficiariosActualizados",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'beneficiario%' AND operacion = 'DELETE') as "beneficiariosEliminados",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'INSERT') as "accionesCreadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'UPDATE') as "accionesActualizadas",
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE (entidad ILIKE 'accion' OR entidad ILIKE 'acciones') AND operacion = 'DELETE') as "accionesEliminadas",
    
    (SELECT COALESCE(SUM(total), 0) FROM eventos_agrupados WHERE entidad ILIKE 'equipo%' AND operacion = 'UPDATE') as "equiposActualizados",
    
    (SELECT total FROM sesiones) as "sesiones";
