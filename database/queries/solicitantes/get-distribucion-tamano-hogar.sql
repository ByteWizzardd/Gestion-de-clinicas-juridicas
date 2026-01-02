-- Obtener solicitantes agrupados por tamaño del hogar
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
WITH hogar_info AS (
    SELECT 
        fh.cant_personas
    FROM solicitantes s
    JOIN familias_y_hogares fh ON s.cedula = fh.cedula_solicitante
    WHERE (
        ($1::DATE IS NULL AND $2::DATE IS NULL)
        OR EXISTS (
            SELECT 1 
            FROM casos c 
            WHERE c.cedula = s.cedula
            AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
            AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
        )
    )
)
SELECT 
    CASE 
        WHEN cant_personas <= 2 THEN '1-2 personas'
        WHEN cant_personas <= 4 THEN '3-4 personas'
        WHEN cant_personas <= 6 THEN '5-6 personas'
        ELSE 'Más de 6 personas'
    END AS tamano_hogar,
    COUNT(*) AS cantidad_solicitantes
FROM hogar_info
GROUP BY tamano_hogar
ORDER BY MIN(cant_personas);
