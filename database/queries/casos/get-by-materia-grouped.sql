-- Obtener casos agrupados por materia, categoría y subcategoría
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Agrupa por materia, categoría y subcategoría (sin ámbito legal)
SELECT 
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    m.nombre_materia,
    COALESCE(cat.nombre_categoria, '') AS nombre_categoria,
    COALESCE(sub.nombre_subcategoria, '') AS nombre_subcategoria,
    COUNT(*) AS cantidad_casos
FROM casos c
INNER JOIN materias m ON c.id_materia = m.id_materia
LEFT JOIN categorias cat ON c.id_materia = cat.id_materia AND c.num_categoria = cat.num_categoria
LEFT JOIN subcategorias sub ON c.id_materia = sub.id_materia 
    AND c.num_categoria = sub.num_categoria 
    AND c.num_subcategoria = sub.num_subcategoria
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY 
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria
ORDER BY 
    m.nombre_materia,
    c.num_categoria,
    c.num_subcategoria;

