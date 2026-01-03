-- Listar municipios de un estado específico
-- Parámetros: $1 = id_estado
SELECT 
    id_estado,
    num_municipio,
    nombre_municipio
FROM municipios
WHERE id_estado = $1 AND habilitado = true
ORDER BY num_municipio, nombre_municipio;

