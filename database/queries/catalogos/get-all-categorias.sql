-- Get all categorias with materia information
SELECT 
    c.id_materia,
    c.num_categoria,
    c.nombre_categoria,
    REPLACE(m.nombre_materia, 'Materia ', '') as nombre_materia,
    c.habilitado
FROM categorias c
JOIN materias m ON c.id_materia = m.id_materia
ORDER BY c.id_materia DESC, c.num_categoria DESC;
