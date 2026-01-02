-- Obtener distribución de casos por núcleo
-- Retorna nombre del núcleo y cantidad de casos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    n.nombre_nucleo,
    COUNT(DISTINCT c.id_caso) AS cantidad
FROM nucleos n
LEFT JOIN casos c ON n.id_nucleo = c.id_nucleo
    AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
WHERE 
    ($3::INTEGER IS NULL OR n.id_nucleo = $3)
GROUP BY n.id_nucleo, n.nombre_nucleo
HAVING COUNT(DISTINCT c.id_caso) > 0
ORDER BY cantidad DESC;
