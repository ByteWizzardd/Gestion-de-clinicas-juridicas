-- Obtener foto de perfil de un usuario por su cédula
-- Parámetro: $1 = cédula
-- Retorna la foto como BYTEA o NULL si no existe
SELECT foto_perfil
FROM usuarios
WHERE cedula = $1;
