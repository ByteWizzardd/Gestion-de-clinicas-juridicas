-- Obtener distribución de casos agrupados por el campo 'tramite'
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional)
SELECT 
    c.tramite AS nombre_tramite,
    COUNT(*) AS cantidad_casos
FROM casos c
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
    AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
GROUP BY c.tramite
ORDER BY cantidad_casos DESC
LIMIT 10; -- Limitamos a los top 10 trámites más comunes para no saturar la gráfica
