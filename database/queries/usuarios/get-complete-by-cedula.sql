-- Obtener usuario completo por cédula con todos los campos necesarios para autocompletar
-- Parámetro: $1 = cédula exacta
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.correo_electronico,
    u.telefono_celular,
    u.nombres || ' ' || u.apellidos AS nombre_completo
FROM usuarios u
WHERE u.cedula = $1
LIMIT 1;

