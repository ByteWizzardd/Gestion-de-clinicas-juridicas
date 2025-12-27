-- Get all caracteristicas with tipo information
SELECT 
    c.id_tipo_caracteristica,
    c.num_caracteristica,
    c.descripcion,
    c.habilitado,
    t.nombre_tipo_caracteristica
FROM caracteristicas c
JOIN tipo_caracteristicas t ON c.id_tipo_caracteristica = t.id_tipo
ORDER BY c.id_tipo_caracteristica DESC, c.num_caracteristica DESC;
