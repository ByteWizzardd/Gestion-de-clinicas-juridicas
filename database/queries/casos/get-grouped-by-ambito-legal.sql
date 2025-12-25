-- Obtener casos agrupados por materia, categoría, subcategoría y ámbito legal con conteos
-- Incluye filtros opcionales por rango de fechas
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    c.num_ambito_legal,
    m.nombre_materia,
    COALESCE(cat.nombre_categoria, '') AS nombre_categoria,
    COALESCE(sub.nombre_subcategoria, '') AS nombre_subcategoria,
    al.nombre_ambito_legal,
    COUNT(*) AS cantidad_casos
FROM casos c
INNER JOIN materias m ON c.id_materia = m.id_materia
LEFT JOIN categorias cat ON c.id_materia = cat.id_materia AND c.num_categoria = cat.num_categoria
LEFT JOIN subcategorias sub ON c.id_materia = sub.id_materia 
    AND c.num_categoria = sub.num_categoria 
    AND c.num_subcategoria = sub.num_subcategoria
INNER JOIN ambitos_legales al ON c.id_materia = al.id_materia 
    AND c.num_categoria = al.num_categoria 
    AND c.num_subcategoria = al.num_subcategoria
    AND c.num_ambito_legal = al.num_ambito_legal
WHERE 
    ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
GROUP BY 
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    c.num_ambito_legal,
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria,
    al.nombre_ambito_legal
ORDER BY 
    m.nombre_materia,
    c.num_categoria,
    c.num_subcategoria,
    c.num_ambito_legal;

