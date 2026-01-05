SELECT 
    id_actividad,
    nombre_actividad,
    habilitado
FROM condicion_actividad
WHERE habilitado = true
ORDER BY id_actividad;

