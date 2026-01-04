-- Get all tipos de caracteristicas
SELECT 
    id_tipo,
    nombre_tipo_caracteristica,
    habilitado
FROM tipo_caracteristicas
ORDER BY id_tipo DESC;
