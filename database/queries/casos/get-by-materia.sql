-- Obtener casos agrupados por materia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
SELECT 
    m.nombre_materia,
    COUNT(DISTINCT c.id_caso) AS cantidad_casos
FROM casos c
INNER JOIN materias m ON c.id_materia = m.id_materia
WHERE 
    ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad_casos DESC, m.nombre_materia;

