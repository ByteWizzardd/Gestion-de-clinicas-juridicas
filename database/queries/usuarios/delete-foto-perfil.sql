-- Eliminar foto de perfil de un usuario (establecer a NULL)
-- Parámetro: $1 = cédula
UPDATE usuarios
SET foto_perfil = NULL
WHERE cedula = $1
RETURNING cedula;
