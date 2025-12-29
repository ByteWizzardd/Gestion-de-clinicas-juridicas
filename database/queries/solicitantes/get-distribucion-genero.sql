-- Obtener solicitantes agrupados por género (usando columna 'sexo')
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    sexo AS genero,
    COUNT(DISTINCT s.cedula) AS cantidad_solicitantes
FROM solicitantes s
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
GROUP BY sexo;
