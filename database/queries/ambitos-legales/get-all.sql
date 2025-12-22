-- Obtener todos los ámbitos legales con información completa
-- Incluye la clave compuesta y la información de materia, categoría y subcategoría
SELECT 
    al.id_materia,
    al.num_categoria,
    al.num_subcategoria,
    al.num_ambito_legal,
    m.nombre_materia AS materia,
    cat.nombre_categoria AS categoria,
    sub.nombre_subcategoria AS subcategoria
FROM ambitos_legales al
INNER JOIN materias m ON al.id_materia = m.id_materia
INNER JOIN categorias cat ON al.id_materia = cat.id_materia AND al.num_categoria = cat.num_categoria
INNER JOIN subcategorias sub ON al.id_materia = sub.id_materia 
    AND al.num_categoria = sub.num_categoria 
    AND al.num_subcategoria = sub.num_subcategoria
ORDER BY m.nombre_materia, cat.nombre_categoria, sub.nombre_subcategoria;

