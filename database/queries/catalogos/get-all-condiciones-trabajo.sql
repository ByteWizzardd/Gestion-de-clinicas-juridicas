-- Get all condiciones de trabajo
SELECT 
    id_trabajo,
    nombre_trabajo,
    habilitado
FROM condicion_trabajo
ORDER BY id_trabajo DESC;
