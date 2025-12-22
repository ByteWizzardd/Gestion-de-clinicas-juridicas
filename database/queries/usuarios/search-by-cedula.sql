-- Buscar usuarios por cédula (búsqueda parcial)
-- Busca en la tabla usuarios (estudiantes, profesores, coordinadores)
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo
FROM usuarios u
WHERE u.cedula LIKE '%' || $1 || '%'
ORDER BY u.cedula
LIMIT 10;

