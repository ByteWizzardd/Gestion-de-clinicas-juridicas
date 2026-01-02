-- Obtener estadísticas KPI para el dashboard
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
WITH casos_filtrados AS (
    SELECT DISTINCT c.id_caso
    FROM casos c
    WHERE 
        ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
        AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
        AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
),
total_casos AS (
    SELECT COUNT(*) AS total
    FROM casos_filtrados
),
casos_riesgo AS (
    SELECT COUNT(DISTINCT cf.id_caso) AS en_riesgo
    FROM casos_filtrados cf
    INNER JOIN casos c ON cf.id_caso = c.id_caso
    LEFT JOIN (
        SELECT id_caso, MAX(fecha_registro) AS ultima_accion
        FROM acciones
        GROUP BY id_caso
    ) acc ON cf.id_caso = acc.id_caso
    LEFT JOIN (
        SELECT id_caso, nuevo_estatus
        FROM cambio_estatus ce1
        WHERE num_cambio = (
            SELECT MAX(num_cambio)
            FROM cambio_estatus ce2
            WHERE ce2.id_caso = ce1.id_caso
        )
    ) est ON cf.id_caso = est.id_caso
    WHERE 
        (acc.ultima_accion IS NULL OR acc.ultima_accion < CURRENT_DATE - INTERVAL '30 days')
        OR est.nuevo_estatus = 'En proceso'
),
total_acciones AS (
    SELECT COUNT(*) AS acciones
    FROM acciones a
    INNER JOIN casos_filtrados cf ON a.id_caso = cf.id_caso
),
casos_archivados AS (
    SELECT COUNT(DISTINCT cf.id_caso) AS archivados
    FROM casos_filtrados cf
    INNER JOIN (
        SELECT id_caso, nuevo_estatus
        FROM cambio_estatus ce1
        WHERE num_cambio = (
            SELECT MAX(num_cambio)
            FROM cambio_estatus ce2
            WHERE ce2.id_caso = ce1.id_caso
        )
    ) est ON cf.id_caso = est.id_caso
    WHERE est.nuevo_estatus = 'Archivado'
),
materia_comun AS (
    SELECT m.nombre_materia, COUNT(*) AS cantidad
    FROM casos_filtrados cf
    INNER JOIN casos c ON cf.id_caso = c.id_caso
    INNER JOIN materias m ON c.id_materia = m.id_materia
    GROUP BY m.nombre_materia
    ORDER BY cantidad DESC
    LIMIT 1
)
SELECT 
    (SELECT total FROM total_casos) AS total_casos,
    (SELECT en_riesgo FROM casos_riesgo) AS casos_en_riesgo,
    (SELECT acciones FROM total_acciones) AS total_acciones,
    (SELECT archivados FROM casos_archivados) AS casos_archivados,
    (SELECT nombre_materia FROM materia_comun) AS materia_mas_comun,
    (SELECT cantidad FROM materia_comun) AS cantidad_materia_comun,
    CASE 
        WHEN (SELECT total FROM total_casos) > 0 
        THEN ROUND(((SELECT archivados FROM casos_archivados)::NUMERIC / (SELECT total FROM total_casos)::NUMERIC) * 100, 0)
        ELSE 0
    END AS tasa_cierre_porcentaje;
