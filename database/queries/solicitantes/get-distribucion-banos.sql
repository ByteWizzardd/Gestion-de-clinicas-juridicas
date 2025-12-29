-- Obtener solicitantes agrupados por cantidad de baños en la vivienda
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
WITH vivienda_info AS (
    SELECT 
        v.cant_banos
    FROM solicitantes s
    JOIN viviendas v ON s.cedula = v.cedula_solicitante
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
        WHEN cant_banos = 0 THEN 'Sin baños'
        WHEN cant_banos = 1 THEN '1 baño'
        WHEN cant_banos = 2 THEN '2 baños'
        ELSE '3+ baños'
    END AS cant_banos,
    COUNT(*) AS cantidad_solicitantes
FROM vivienda_info
GROUP BY 
    CASE 
        WHEN cant_banos = 0 THEN 'Sin baños'
        WHEN cant_banos = 1 THEN '1 baño'
        WHEN cant_banos = 2 THEN '2 baños'
        ELSE '3+ baños'
    END
ORDER BY 
    CASE 
        WHEN (CASE 
            WHEN cant_banos = 0 THEN 'Sin baños'
            WHEN cant_banos = 1 THEN '1 baño'
            WHEN cant_banos = 2 THEN '2 baños'
            ELSE '3+ baños'
        END) = 'Sin baños' THEN 0
        WHEN (CASE 
            WHEN cant_banos = 0 THEN 'Sin baños'
            WHEN cant_banos = 1 THEN '1 baño'
            WHEN cant_banos = 2 THEN '2 baños'
            ELSE '3+ baños'
        END) = '1 baño' THEN 1
        WHEN (CASE 
            WHEN cant_banos = 0 THEN 'Sin baños'
            WHEN cant_banos = 1 THEN '1 baño'
            WHEN cant_banos = 2 THEN '2 baños'
            ELSE '3+ baños'
        END) = '2 baños' THEN 2
        ELSE 3
    END;
