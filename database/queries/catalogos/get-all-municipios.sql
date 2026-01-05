-- Get all municipios with estado information
SELECT 
    m.id_estado,
    m.num_municipio,
    m.nombre_municipio,
    e.nombre_estado,
    m.habilitado
FROM municipios m
JOIN estados e ON m.id_estado = e.id_estado
ORDER BY m.id_estado DESC, m.num_municipio DESC;
