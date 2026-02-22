-- Obtener casos agrupados por estatus para generar reportes
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = term (opcional)
WITH ultimo_estatus_por_caso AS (
    SELECT DISTINCT ON (id_caso)
        id_caso,
        nuevo_estatus
    FROM cambio_estatus
    ORDER BY id_caso, num_cambio DESC
)
SELECT 
    COALESCE(ue.nuevo_estatus, 'En proceso') AS nombre_estatus,
    COUNT(*) AS cantidad_casos,
    MIN(c.id_caso) AS id_caso_ejemplo,
    MIN(c.fecha_solicitud) AS fecha_solicitud_min,
    MAX(c.fecha_solicitud) AS fecha_solicitud_max
FROM casos c
LEFT JOIN ultimo_estatus_por_caso ue ON c.id_caso = ue.id_caso
WHERE 
    ($3::TEXT IS NULL OR EXISTS (
        SELECT 1 FROM ocurren_en oe WHERE oe.id_caso = c.id_caso AND oe.term = $3
    ))
    AND (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR EXISTS (
            SELECT 1 FROM ocurren_en oe
            JOIN semestres sem ON oe.term = sem.term
            WHERE oe.id_caso = c.id_caso
            AND ($2::DATE IS NULL OR sem.fecha_inicio <= $2)
            AND ($1::DATE IS NULL OR sem.fecha_fin >= $1)
        )
    )
GROUP BY COALESCE(ue.nuevo_estatus, 'En proceso')
ORDER BY cantidad_casos DESC, nombre_estatus;

