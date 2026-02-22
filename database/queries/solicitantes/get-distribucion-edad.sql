-- Obtener solicitantes agrupados por rangos de edad
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
WITH edades AS (
    SELECT 
        cedula,
        EXTRACT(YEAR FROM AGE(NOW(), fecha_nacimiento)) AS edad
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
)
SELECT 
    CASE 
        WHEN edad < 18 THEN 'Menor de 18'
        WHEN edad BETWEEN 18 AND 24 THEN '18-24'
        WHEN edad BETWEEN 25 AND 34 THEN '25-34'
        WHEN edad BETWEEN 35 AND 44 THEN '35-44'
        WHEN edad BETWEEN 45 AND 54 THEN '45-54'
        WHEN edad BETWEEN 55 AND 64 THEN '55-64'
        ELSE '65+'
    END AS rango_edad,
    COUNT(*) AS cantidad_solicitantes
FROM edades
GROUP BY rango_edad
ORDER BY MIN(edad);
