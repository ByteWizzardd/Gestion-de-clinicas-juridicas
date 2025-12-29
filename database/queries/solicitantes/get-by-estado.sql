-- Obtener solicitantes agrupados por estado
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Si se proporcionan fechas, solo cuenta solicitantes que tienen casos en el rango de fechas
-- Si no se proporcionan fechas, cuenta TODOS los solicitantes
SELECT 
    COALESCE(e.nombre_estado, 'Sin estado') AS nombre_estado,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
LEFT JOIN estados e ON s.id_estado = e.id_estado
WHERE 
    ($1::DATE IS NULL AND $2::DATE IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c 
        WHERE c.cedula = s.cedula
        AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
        AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
    )
GROUP BY COALESCE(e.id_estado, 0), COALESCE(e.nombre_estado, 'Sin estado')
ORDER BY cantidad_solicitantes DESC, nombre_estado;
