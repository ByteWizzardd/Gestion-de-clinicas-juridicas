SELECT 
    entidad, 
    operacion, 
    COUNT(*)::int as total, 
    MAX(fecha_evento) as ultima_actividad
FROM auditoria_eventos 
GROUP BY entidad, operacion
