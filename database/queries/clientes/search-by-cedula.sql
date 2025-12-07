-- Buscar clientes por cédula (búsqueda parcial)
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    cedula,
    nombres,
    apellidos,
    nombres || ' ' || apellidos AS nombre_completo
FROM clientes
WHERE cedula LIKE '%' || $1 || '%'
ORDER BY cedula
LIMIT 10;

