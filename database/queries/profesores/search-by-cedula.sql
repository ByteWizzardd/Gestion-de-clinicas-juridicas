-- Buscar profesores por cédula (búsqueda parcial)
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    p.cedula_profesor AS cedula,
    c.nombres,
    c.apellidos,
    c.nombres || ' ' || c.apellidos AS nombre_completo
FROM profesores p
INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
INNER JOIN clientes c ON u.cedula = c.cedula
WHERE p.cedula_profesor LIKE '%' || $1 || '%'
ORDER BY p.cedula_profesor
LIMIT 10;

