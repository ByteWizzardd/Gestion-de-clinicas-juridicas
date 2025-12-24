-- Buscar beneficiarios por cédula (búsqueda exacta o parcial)
-- Parámetro: $1 = cédula a buscar (puede ser parcial)
SELECT 
    b.cedula,
    b.nombres,
    b.apellidos,
    b.fecha_nac AS fecha_nacimiento,
    b.sexo,
    b.nombres || ' ' || b.apellidos AS nombre_completo
FROM beneficiarios b
WHERE b.cedula LIKE '%' || $1 || '%'
ORDER BY b.cedula
LIMIT 10;

