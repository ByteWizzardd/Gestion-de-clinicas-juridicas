-- Obtener solicitantes agrupados por rangos de ingresos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
WITH ingresos AS (
    SELECT 
        fh.ingresos_mensuales
    FROM solicitantes s
    JOIN familias_y_hogares fh ON s.cedula = fh.cedula_solicitante
    WHERE (
        ($1::DATE IS NULL AND $2::DATE IS NULL AND $3::TEXT IS NULL)
        OR EXISTS (
            SELECT 1 
            FROM casos c 
            WHERE c.cedula = s.cedula
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
            AND ($3::TEXT IS NULL OR EXISTS (
                SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $3
            ))
        )
    )
)
SELECT 
    CASE 
        WHEN ingresos_mensuales = 0 THEN 'Sin ingresos'
        WHEN ingresos_mensuales <= 50 THEN '0 - 50'
        WHEN ingresos_mensuales <= 100 THEN '51 - 100'
        WHEN ingresos_mensuales <= 250 THEN '101 - 250'
        WHEN ingresos_mensuales <= 500 THEN '251 - 500'
        ELSE 'Más de 500'
    END AS rango_ingresos,
    COUNT(*) AS cantidad_solicitantes
FROM ingresos
GROUP BY rango_ingresos
ORDER BY MIN(ingresos_mensuales);
