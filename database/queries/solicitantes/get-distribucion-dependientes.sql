-- Obtener solicitantes agrupados por cantidad de dependientes (personas que no trabajan) en el hogar
-- Fórmula: cant_personas - cant_trabajadores
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
WITH hogar_info AS (
    SELECT 
        (fh.cant_personas - fh.cant_trabajadores) as cant_dependientes
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
        WHEN cant_dependientes <= 0 THEN 'Sin dependientes'
        WHEN cant_dependientes = 1 THEN '1 dependiente'
        WHEN cant_dependientes = 2 THEN '2 dependientes'
        WHEN cant_dependientes = 3 THEN '3 dependientes'
        ELSE '4+ dependientes'
    END AS cantidad_dependientes,
    COUNT(*) AS cantidad_solicitantes
FROM hogar_info
GROUP BY cantidad_dependientes
ORDER BY MIN(cant_dependientes);
