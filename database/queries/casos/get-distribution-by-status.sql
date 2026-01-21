-- Obtener distribución de casos por estatus
-- Retorna nombre del estatus y cantidad de casos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
WITH ultimo_estatus_por_caso AS (
    -- Para cada caso, obtener el último cambio de estatus (el de num_cambio más alto)
    SELECT DISTINCT ON (id_caso)
        id_caso,
        nuevo_estatus
    FROM cambio_estatus
    ORDER BY id_caso, num_cambio DESC
)
SELECT 
    COALESCE(ue.nuevo_estatus, 'En proceso') AS nombre_estatus,
    COUNT(*) AS cantidad
FROM casos c
-- LEFT JOIN para obtener el último estatus de todos los casos
LEFT JOIN ultimo_estatus_por_caso ue ON c.id_caso = ue.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
    AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
GROUP BY COALESCE(ue.nuevo_estatus, 'En proceso')
ORDER BY cantidad DESC;
