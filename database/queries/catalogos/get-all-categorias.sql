-- Get all categorias with materia information
SELECT 
    c.id_materia,
    c.num_categoria,
    c.nombre_categoria,
    m.nombre_materia
FROM categorias c
JOIN materias m ON c.id_materia = m.id_materia
ORDER BY c.id_materia DESC, c.num_categoria DESC;
