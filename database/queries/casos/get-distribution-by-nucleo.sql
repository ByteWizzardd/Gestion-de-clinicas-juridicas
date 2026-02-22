-- Obtener distribución de casos por núcleo
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    n.nombre_nucleo,
    COUNT(DISTINCT c.id_caso) AS cantidad
FROM nucleos n
LEFT JOIN casos c ON n.id_nucleo = c.id_nucleo
    AND ($3::INTEGER IS NULL OR n.id_nucleo = $3)
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
WHERE 
    ($3::INTEGER IS NULL OR n.id_nucleo = $3)
GROUP BY n.id_nucleo, n.nombre_nucleo
HAVING COUNT(DISTINCT c.id_caso) > 0
ORDER BY cantidad DESC;
