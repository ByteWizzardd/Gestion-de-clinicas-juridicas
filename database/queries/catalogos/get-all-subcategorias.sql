-- Get all subcategorias with categoria and materia information
SELECT 
    s.id_materia,
    s.num_categoria,
    s.num_subcategoria,
    s.nombre_subcategoria,
    c.nombre_categoria,
    m.nombre_materia
FROM subcategorias s
JOIN categorias c ON s.id_materia = c.id_materia AND s.num_categoria = c.num_categoria
JOIN materias m ON s.id_materia = m.id_materia
ORDER BY s.id_materia DESC, s.num_categoria DESC, s.num_subcategoria DESC;
