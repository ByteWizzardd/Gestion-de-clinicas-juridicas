-- Get all ambitos legales with full hierarchy
SELECT 
    a.id_materia,
    a.num_categoria,
    a.num_subcategoria,
    a.num_ambito_legal,
    a.nombre_ambito_legal,
    s.nombre_subcategoria,
    c.nombre_categoria,
    m.nombre_materia
FROM ambitos_legales a
JOIN subcategorias s ON a.id_materia = s.id_materia 
    AND a.num_categoria = s.num_categoria 
    AND a.num_subcategoria = s.num_subcategoria
JOIN categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
JOIN materias m ON a.id_materia = m.id_materia
ORDER BY a.id_materia DESC, a.num_categoria DESC, a.num_subcategoria DESC, a.num_ambito_legal DESC;
