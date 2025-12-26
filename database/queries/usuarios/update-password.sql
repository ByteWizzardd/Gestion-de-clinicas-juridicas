-- Actualizar contraseña de un usuario
-- Parámetros:
-- $1 = correo_electronico
-- $2 = nueva contraseña (hash)

UPDATE usuarios
SET contrasena = $2
WHERE correo_electronico = $1
RETURNING cedula, correo_electronico;

