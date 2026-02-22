-- Obtener casos agrupados por materia, categoría y subcategoría para informe resumen
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
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
    ($3::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $3
    ))
    AND (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR EXISTS (
            SELECT 1 FROM ocurren_en oe
            JOIN semestres sem ON oe.term = sem.term
            WHERE oe.id_caso = c.id_caso
            AND ($2::DATE IS NULL OR sem.fecha_inicio <= $2)
            AND ($1::DATE IS NULL OR sem.fecha_fin >= $1)
        )
    )
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

