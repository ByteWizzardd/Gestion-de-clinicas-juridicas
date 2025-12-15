-- Buscar clientes por correo electrónico (búsqueda exacta)
-- Parámetro: $1 = correo electrónico a buscar
SELECT 
    cedula,
    nombres,
    apellidos,
    correo_electronico,
    nombres || ' ' || apellidos AS nombre_completo
FROM clientes
WHERE LOWER(correo_electronico) = LOWER($1)
LIMIT 1;

