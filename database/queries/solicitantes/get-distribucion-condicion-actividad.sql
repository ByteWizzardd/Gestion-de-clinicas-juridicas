-- Obtener solicitantes agrupados por condición de actividad
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    ca.nombre_actividad AS condicion_actividad,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN condicion_actividad ca ON s.id_actividad = ca.id_actividad
WHERE (
    ($1::DATE IS NULL AND $2::DATE IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c 
        WHERE c.cedula = s.cedula
        AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
        AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
    )
)
GROUP BY ca.id_actividad, ca.nombre_actividad
ORDER BY ca.id_actividad ASC;
