-- Obtener distribución de casos por estatus
-- Retorna nombre del estatus y cantidad de casos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    COALESCE(ce.nuevo_estatus, 'En proceso') AS nombre_estatus,
    COUNT(DISTINCT c.id_caso) AS cantidad
FROM casos c
LEFT JOIN se_le_asigna sla ON c.id_caso = sla.id_caso
LEFT JOIN (
    SELECT DISTINCT ON (id_caso) 
        id_caso, 
        nuevo_estatus
    FROM cambio_estatus
    ORDER BY id_caso, num_cambio DESC
) ce ON c.id_caso = ce.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
    AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
    AND ($4::VARCHAR IS NULL OR sla.term = $4)
GROUP BY ce.nuevo_estatus
ORDER BY cantidad DESC;
