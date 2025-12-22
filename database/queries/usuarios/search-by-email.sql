-- Buscar usuarios por correo electrónico (búsqueda exacta)
-- Busca en la tabla usuarios (estudiantes, profesores, coordinadores)
-- Parámetro: $1 = correo electrónico a buscar
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.correo_electronico,
    u.nombres || ' ' || u.apellidos AS nombre_completo
FROM usuarios u
WHERE LOWER(u.correo_electronico) = LOWER($1)
LIMIT 1;

