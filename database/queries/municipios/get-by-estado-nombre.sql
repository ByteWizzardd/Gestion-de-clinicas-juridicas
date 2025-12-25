-- Listar municipios de un estado específico por nombre
-- Parámetros: $1 = nombre_estado
SELECT 
    m.id_estado,
    m.num_municipio,
    m.nombre_municipio,
    e.nombre_estado
FROM municipios m
JOIN estados e ON m.id_estado = e.id_estado
WHERE e.nombre_estado = $1
ORDER BY m.num_municipio, m.nombre_municipio;

