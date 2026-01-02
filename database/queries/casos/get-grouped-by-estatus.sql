-- Obtener casos agrupados por estatus para generar reportes
-- Retorna información de casos agrupados por estatus actual
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- ESTRATEGIA: Primero obtener el último estatus de cada caso en un CTE, luego hacer LEFT JOIN desde casos
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
    COUNT(*) AS cantidad_casos,
    -- Información del caso (tomamos el primer caso como ejemplo para estructura)
    MIN(c.id_caso) AS id_caso_ejemplo,
    MIN(c.fecha_solicitud) AS fecha_solicitud_min,
    MAX(c.fecha_solicitud) AS fecha_solicitud_max
FROM casos c
LEFT JOIN ultimo_estatus_por_caso ue ON c.id_caso = ue.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY COALESCE(ue.nuevo_estatus, 'En proceso')
ORDER BY cantidad_casos DESC, nombre_estatus;

