-- Listar parroquias de un municipio específico
-- Parámetros: $1 = id_estado, $2 = num_municipio
SELECT 
    id_estado,
    num_municipio,
    num_parroquia,
    nombre_parroquia
FROM parroquias
WHERE id_estado = $1 AND num_municipio = $2
ORDER BY num_parroquia, nombre_parroquia;

