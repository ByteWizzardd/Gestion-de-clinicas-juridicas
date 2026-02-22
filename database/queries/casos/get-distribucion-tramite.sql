-- Obtener distribución de casos agrupados por el campo 'tramite'
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    c.tramite AS nombre_tramite,
    COUNT(*) AS cantidad_casos
FROM casos c
WHERE 
    ($3::INTEGER IS NULL OR c.id_nucleo = $3)
    AND ($4::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $4
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
GROUP BY c.tramite
ORDER BY cantidad_casos DESC
LIMIT 10;
