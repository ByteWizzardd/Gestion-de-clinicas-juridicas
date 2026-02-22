-- Obtener solicitantes agrupados por estado civil
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
SELECT 
    estado_civil,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
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
GROUP BY estado_civil
ORDER BY estado_civil ASC;
