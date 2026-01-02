-- Obtener todos los estados
SELECT 
    id_estado,
    nombre_estado
FROM estados
WHERE habilitado = true
ORDER BY nombre_estado;

