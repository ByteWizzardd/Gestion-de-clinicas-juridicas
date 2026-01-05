-- Busca usuarios por nombre_usuario (búsqueda exacta)
-- Parámetros: $1 = nombre_usuario
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.nombre_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo
FROM usuarios u
WHERE u.nombre_usuario = $1;
