-- Get all nucleos with location information
SELECT 
    n.id_nucleo,
    n.nombre_nucleo,
    n.id_estado,
    n.num_municipio,
    n.num_parroquia,
    e.nombre_estado,
    m.nombre_municipio,
    p.nombre_parroquia,
    n.habilitado
FROM nucleos n
JOIN parroquias p ON n.id_estado = p.id_estado 
    AND n.num_municipio = p.num_municipio 
    AND n.num_parroquia = p.num_parroquia
JOIN municipios m ON p.id_estado = m.id_estado AND p.num_municipio = m.num_municipio
JOIN estados e ON p.id_estado = e.id_estado
ORDER BY n.id_nucleo DESC;
