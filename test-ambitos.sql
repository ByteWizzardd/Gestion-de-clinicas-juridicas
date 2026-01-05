-- Simple test query to check if ambitos_legales table exists and has data
SELECT COUNT(*) as total FROM ambitos_legales;

-- If that works, try the full query
SELECT 
    a.id_materia,
    a.num_categoria,
    a.num_subcategoria,
    a.num_ambito_legal,
    a.nombre_ambito_legal,
    m.nombre_materia,
    c.nombre_categoria,
    s.nombre_subcategoria
FROM ambitos_legales a
JOIN materias m ON a.id_materia = m.id_materia
JOIN categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
JOIN subcategorias s ON a.id_materia = s.id_materia AND a.num_categoria = s.num_categoria AND a.num_subcategoria = s.num_subcategoria
LIMIT 5;
