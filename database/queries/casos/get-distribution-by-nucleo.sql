-- Obtener distribución de casos por núcleo
-- Retorna nombre del núcleo y cantidad de casos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    n.nombre_nucleo,
    COUNT(c.id_caso) AS cantidad
FROM nucleos n
LEFT JOIN casos c ON n.id_nucleo = c.id_nucleo
    AND ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
LEFT JOIN se_le_asigna sla ON c.id_caso = sla.id_caso
WHERE 
    ($3::INTEGER IS NULL OR n.id_nucleo = $3)
    AND ($4::VARCHAR IS NULL OR sla.term = $4)
GROUP BY n.id_nucleo, n.nombre_nucleo
HAVING COUNT(c.id_caso) > 0
ORDER BY cantidad DESC;
