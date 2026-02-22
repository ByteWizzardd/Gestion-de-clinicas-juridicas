-- Obtener solicitantes agrupados por cantidad de niños en el hogar
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
WITH hogar_info AS (
    SELECT 
        fh.cant_ninos
    FROM solicitantes s
    JOIN familias_y_hogares fh ON s.cedula = fh.cedula_solicitante
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
)
SELECT 
    CASE 
        WHEN cant_ninos = 0 THEN 'Sin niños'
        WHEN cant_ninos = 1 THEN '1 niño'
        WHEN cant_ninos = 2 THEN '2 niños'
        ELSE '3+ niños'
    END AS ninos_hogar,
    COUNT(*) AS cantidad_solicitantes
FROM hogar_info
GROUP BY ninos_hogar
ORDER BY MIN(cant_ninos);
