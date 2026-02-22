-- Obtener solicitantes agrupados por estado
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
-- Si se proporcionan fechas o term, solo cuenta solicitantes que tienen casos en el rango/semestre
-- Si no se proporcionan, cuenta TODOS los solicitantes
SELECT 
    COALESCE(e.nombre_estado, 'Sin estado') AS nombre_estado,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
LEFT JOIN estados e ON s.id_estado = e.id_estado
WHERE 
    ($1::DATE IS NULL AND $2::DATE IS NULL AND $3::TEXT IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c 
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
GROUP BY COALESCE(e.id_estado, 0), COALESCE(e.nombre_estado, 'Sin estado')
ORDER BY cantidad_solicitantes DESC, nombre_estado;
