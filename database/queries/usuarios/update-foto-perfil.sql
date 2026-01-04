-- Actualizar foto de perfil de un usuario
-- Parámetros: $1 = cédula, $2 = foto_perfil (BYTEA)
UPDATE usuarios
SET foto_perfil = $2
WHERE cedula = $1
RETURNING cedula;
