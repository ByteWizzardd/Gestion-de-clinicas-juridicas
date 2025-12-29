-- Get all subcategorias with categoria and materia information
SELECT 
    s.id_materia,
    s.num_categoria,
    s.num_subcategoria,
    s.nombre_subcategoria,
    REPLACE(m.nombre_materia, 'Materia ', '') as nombre_materia,
    c.nombre_categoria
FROM subcategorias s
JOIN categorias c ON s.id_materia = c.id_materia AND s.num_categoria = c.num_categoria
JOIN materias m ON s.id_materia = m.id_materia
ORDER BY s.id_materia DESC, s.num_categoria DESC, s.num_subcategoria DESC;
