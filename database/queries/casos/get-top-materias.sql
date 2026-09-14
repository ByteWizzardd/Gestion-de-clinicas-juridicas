-- Obtener top 5 tipos de casos por materia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    m.nombre_materia,
    COUNT(DISTINCT c.id_caso) AS cantidad
FROM materias m
INNER JOIN casos c ON m.id_materia = c.id_materia
WHERE 
    ($3::INTEGER IS NULL OR c.id_nucleo = $3)
    AND ($4::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $4
    ))
    AND (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR caso_con_actividad_en_rango(c.id_caso, $1::DATE, $2::DATE)
    )
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad DESC
LIMIT 5;
