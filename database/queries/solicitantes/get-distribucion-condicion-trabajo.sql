-- Obtener solicitantes agrupados por condición de trabajo
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    ct.nombre_trabajo AS condicion_trabajo,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN condicion_trabajo ct ON s.id_trabajo = ct.id_trabajo
WHERE (
    ($1::DATE IS NULL AND $2::DATE IS NULL AND $3::TEXT IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c 
        LEFT JOIN ocurren_en oe ON oe.id_caso = c.id_caso
        WHERE c.cedula = s.cedula
        AND ($3::TEXT IS NULL OR EXISTS (
            SELECT 1 FROM ocurren_en oe2 WHERE oe2.id_caso = c.id_caso AND oe2.term = $3
        ))
        AND (
            ($1::DATE IS NULL AND $2::DATE IS NULL)
            OR EXISTS (
                SELECT 1 FROM ocurren_en oe2
                JOIN semestres sem ON oe2.term = sem.term
                WHERE oe2.id_caso = c.id_caso
                AND ($2::DATE IS NULL OR sem.fecha_inicio <= $2)
                AND ($1::DATE IS NULL OR sem.fecha_fin >= $1)
            )
        )
    )
)
GROUP BY ct.id_trabajo, ct.nombre_trabajo
ORDER BY ct.id_trabajo ASC;
