-- Obtener beneficiarios agrupados por tipo (Directo/Indirecto)
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    b.tipo_beneficiario,
    COUNT(*) AS cantidad_beneficiarios
FROM beneficiarios b
INNER JOIN casos c ON b.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
GROUP BY b.tipo_beneficiario
ORDER BY cantidad_beneficiarios DESC, b.tipo_beneficiario;

