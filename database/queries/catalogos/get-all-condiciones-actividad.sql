-- Get all condiciones de actividad
SELECT 
    id_actividad,
    nombre_actividad,
    habilitado
FROM condicion_actividad
ORDER BY id_actividad DESC;
