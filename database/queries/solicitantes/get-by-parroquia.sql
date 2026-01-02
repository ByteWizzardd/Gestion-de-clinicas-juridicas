-- Obtener solicitantes agrupados por parroquia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Si se proporcionan fechas, solo cuenta solicitantes que tienen casos en el rango de fechas
-- Si no se proporcionan fechas, cuenta TODOS los solicitantes
SELECT 
    COALESCE(p.nombre_parroquia, 'Sin parroquia') AS nombre_parroquia,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
LEFT JOIN parroquias p ON s.id_estado = p.id_estado 
    AND s.num_municipio = p.num_municipio 
    AND s.num_parroquia = p.num_parroquia
WHERE 
    ($1::DATE IS NULL AND $2::DATE IS NULL)
    OR EXISTS (
        SELECT 1 
        FROM casos c 
        WHERE c.cedula = s.cedula
        AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
        AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
    )
GROUP BY COALESCE(p.id_estado, 0), COALESCE(p.num_municipio, 0), COALESCE(p.num_parroquia, 0), COALESCE(p.nombre_parroquia, 'Sin parroquia')
ORDER BY cantidad_solicitantes DESC, nombre_parroquia
LIMIT 20; -- Top 20 parroquias

