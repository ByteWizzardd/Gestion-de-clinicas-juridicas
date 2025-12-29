-- Obtener solicitantes agrupados por condición de trabajo
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    ct.nombre_trabajo AS condicion_trabajo,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
JOIN condicion_trabajo ct ON s.id_trabajo = ct.id_trabajo
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
GROUP BY ct.id_trabajo, ct.nombre_trabajo
ORDER BY ct.id_trabajo ASC;
