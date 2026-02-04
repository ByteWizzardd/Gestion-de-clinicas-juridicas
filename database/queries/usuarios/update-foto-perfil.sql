-- Actualizar foto de perfil de un usuario
-- Parámetros: $1 = cédula, $2 = foto_perfil (VARCHAR - URL de Vercel Blob)
UPDATE usuarios
SET foto_perfil = $2
WHERE cedula = $1
RETURNING cedula, foto_perfil;
