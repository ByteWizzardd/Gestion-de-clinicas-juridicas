-- Buscar solicitantes por cédula (búsqueda parcial)
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    s.cedula,
    s.nombres,
    s.apellidos,
    s.nombres || ' ' || s.apellidos AS nombre_completo
FROM solicitantes s
WHERE s.cedula LIKE '%' || $1 || '%'
ORDER BY s.cedula
LIMIT 10;

