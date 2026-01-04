-- Obtener estudiantes involucrados agrupados por materia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Agrupa solo por materia (sumando todos los estudiantes de cada materia)
-- Usa la tabla se_le_asigna y obtiene la materia del caso
SELECT 
    m.nombre_materia,
    NULL AS nombre_categoria,
    NULL AS nombre_subcategoria,
    COUNT(DISTINCT sla.cedula_estudiante) AS cantidad_estudiantes
FROM se_le_asigna sla
INNER JOIN casos c ON sla.id_caso = c.id_caso
INNER JOIN materias m ON c.id_materia = m.id_materia
WHERE 
    sla.habilitado = true
    AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad_estudiantes DESC, m.nombre_materia;

