-- Obtener top 5 tipos de casos por materia
-- Retorna nombre de la materia y cantidad de casos
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional), $3 = id_nucleo (opcional), $4 = term (opcional)
SELECT 
    m.nombre_materia,
    COUNT(DISTINCT c.id_caso) AS cantidad
FROM materias m
INNER JOIN casos c ON m.id_materia = c.id_materia
WHERE 
    ($1::DATE IS NULL OR c.fecha_solicitud >= $1)
    AND ($2::DATE IS NULL OR c.fecha_solicitud <= $2)
    AND ($3::INTEGER IS NULL OR c.id_nucleo = $3)
    AND (
        $4::VARCHAR IS NULL 
        OR EXISTS (
            SELECT 1 
            FROM se_le_asigna sla 
            WHERE sla.id_caso = c.id_caso 
            AND sla.term = $4
        )
    )
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad DESC
LIMIT 5;
