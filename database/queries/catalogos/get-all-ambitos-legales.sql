-- Get all ambitos legales with related information
SELECT 
    a.id_materia,
    a.num_categoria,
    a.num_subcategoria,
    a.num_ambito_legal,
    a.nombre_ambito_legal,
    REPLACE(m.nombre_materia, 'Materia ', '') as nombre_materia,
    c.nombre_categoria,
    s.nombre_subcategoria
FROM ambitos_legales a
JOIN materias m ON a.id_materia = m.id_materia
JOIN categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
JOIN subcategorias s ON a.id_materia = s.id_materia AND a.num_categoria = s.num_categoria AND a.num_subcategoria = s.num_subcategoria
ORDER BY a.id_materia DESC, a.num_categoria DESC, a.num_subcategoria DESC, a.num_ambito_legal DESC;
