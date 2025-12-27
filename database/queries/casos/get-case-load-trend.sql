-- Obtener tendencia de carga de casos por mes
-- Retorna mes y cantidad de casos por estatus
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
WITH meses AS (
    SELECT 
        DATE_TRUNC('month', fecha_solicitud) AS mes,
        c.id_caso,
        c.id_nucleo
    FROM casos c
    WHERE 
        ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
        AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
        AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
),
casos_con_estatus AS (
    SELECT 
        m.mes,
        m.id_caso,
        COALESCE(ce.nuevo_estatus, 'En proceso') AS estatus
    FROM meses m
    LEFT JOIN (
        SELECT DISTINCT ON (id_caso) 
            id_caso, 
            nuevo_estatus
        FROM cambio_estatus
        ORDER BY id_caso, num_cambio DESC
    ) ce ON m.id_caso = ce.id_caso
    WHERE (
        $4::VARCHAR IS NULL 
        OR EXISTS (
            SELECT 1 
            FROM se_le_asigna sla 
            WHERE sla.id_caso = m.id_caso 
            AND sla.term = $4
        )
    )
)
SELECT 
    TO_CHAR(mes, 'YYYY-MM') AS mes,
    estatus,
    COUNT(DISTINCT id_caso) AS cantidad
FROM casos_con_estatus
GROUP BY mes, estatus
ORDER BY mes, estatus;
