SELECT 
    id_trabajo,
    nombre_trabajo,
    habilitado
FROM condicion_trabajo
WHERE habilitado = true
ORDER BY id_trabajo;

