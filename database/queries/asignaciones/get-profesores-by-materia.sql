-- Obtener profesores involucrados agrupados por materia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    m.nombre_materia,
    NULL AS nombre_categoria,
    NULL AS nombre_subcategoria,
    COUNT(DISTINCT s.cedula_profesor) AS cantidad_profesores
FROM supervisa s
INNER JOIN casos c ON s.id_caso = c.id_caso
INNER JOIN materias m ON c.id_materia = m.id_materia
WHERE 
    s.habilitado = true
    AND ($3::TEXT IS NULL OR EXISTS (
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
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad_profesores DESC, m.nombre_materia;
