-- Obtener beneficiarios agrupados por tipo, materia, categoría y subcategoría
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Agrupa por tipo_beneficiario, materia, categoría y subcategoría (sin ámbito legal)
-- Incluye el tipo_beneficiario para poder filtrar después, pero agrupa por materia-categoría-subcategoría
SELECT 
    b.tipo_beneficiario,
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    m.nombre_materia,
    COALESCE(cat.nombre_categoria, '') AS nombre_categoria,
    COALESCE(sub.nombre_subcategoria, '') AS nombre_subcategoria,
    COUNT(*) AS cantidad_beneficiarios
FROM beneficiarios b
INNER JOIN casos c ON b.id_caso = c.id_caso
INNER JOIN materias m ON c.id_materia = m.id_materia
LEFT JOIN categorias cat ON c.id_materia = cat.id_materia AND c.num_categoria = cat.num_categoria
LEFT JOIN subcategorias sub ON c.id_materia = sub.id_materia 
    AND c.num_categoria = sub.num_categoria 
    AND c.num_subcategoria = sub.num_subcategoria
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY 
    b.tipo_beneficiario,
    c.id_materia,
    c.num_categoria,
    c.num_subcategoria,
    m.nombre_materia,
    cat.nombre_categoria,
    sub.nombre_subcategoria
ORDER BY 
    b.tipo_beneficiario,
    m.nombre_materia,
    c.num_categoria,
    c.num_subcategoria;

