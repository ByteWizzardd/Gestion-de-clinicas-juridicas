-- Obtener solicitantes agrupados por nivel educativo
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    ne.descripcion AS nivel_educativo,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN niveles_educativos ne ON s.id_nivel_educativo = ne.id_nivel_educativo
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
GROUP BY ne.id_nivel_educativo, ne.descripcion
ORDER BY ne.id_nivel_educativo ASC;
