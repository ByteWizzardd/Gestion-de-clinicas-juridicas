-- Buscar estudiantes por cédula (búsqueda parcial)
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    e.cedula_estudiante AS cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo
FROM estudiantes e
INNER JOIN usuarios u ON e.cedula_estudiante = u.cedula
WHERE e.cedula_estudiante LIKE '%' || $1 || '%'
ORDER BY e.cedula_estudiante
LIMIT 10;

