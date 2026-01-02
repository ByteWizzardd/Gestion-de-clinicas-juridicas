-- Obtener profesores involucrados agrupados por materia
-- Parámetros: $1 = fecha_inicio (opcional), $2 = fecha_fin (opcional)
-- Agrupa solo por materia (sumando todos los profesores de cada materia)
-- Usa la tabla supervisa y obtiene la materia del caso
SELECT 
    m.nombre_materia,
    NULL AS nombre_categoria,
    NULL AS nombre_subcategoria,
    COUNT(DISTINCT s.cedula_profesor) AS cantidad_profesores
FROM supervisa s
INNER JOIN casos c ON s.id_caso = c.id_caso
INNER JOIN materias m ON c.id_materia = m.id_materia
WHERE 
    s.habilitado = true
    AND ($1::DATE IS NULL OR c.fecha_inicio_caso >= $1)
    AND ($2::DATE IS NULL OR c.fecha_inicio_caso <= $2)
GROUP BY m.id_materia, m.nombre_materia
ORDER BY cantidad_profesores DESC, m.nombre_materia;

