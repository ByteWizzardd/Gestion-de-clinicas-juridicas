-- Obtener todos los casos agrupados por ámbito legal (sin agrupar por materia)
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    al.nombre_ambito_legal,
    COUNT(DISTINCT c.id_caso) AS cantidad_casos
FROM casos c
INNER JOIN ambitos_legales al ON c.id_materia = al.id_materia
    AND c.num_categoria = al.num_categoria
    AND c.num_subcategoria = al.num_subcategoria
    AND c.num_ambito_legal = al.num_ambito_legal
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
GROUP BY al.nombre_ambito_legal
ORDER BY cantidad_casos DESC, al.nombre_ambito_legal;

