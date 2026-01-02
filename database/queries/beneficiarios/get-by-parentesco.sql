-- Obtener beneficiarios agrupados por parentesco
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    b.parentesco,
    COUNT(*) AS cantidad_beneficiarios
FROM beneficiarios b
INNER JOIN casos c ON b.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY b.parentesco
ORDER BY cantidad_beneficiarios DESC, b.parentesco;

