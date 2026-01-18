-- Get all parroquias with municipio and estado information
SELECT 
    p.num_parroquia,
    p.nombre_parroquia,
    p.id_estado,
    p.num_municipio,
    e.nombre_estado,
    m.nombre_municipio,
    p.habilitado
FROM parroquias p
JOIN municipios m ON p.id_estado = m.id_estado AND p.num_municipio = m.num_municipio
JOIN estados e ON p.id_estado = e.id_estado
ORDER BY p.id_estado DESC, p.num_municipio DESC, p.num_parroquia DESC;
