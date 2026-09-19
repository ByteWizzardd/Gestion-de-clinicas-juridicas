-- Obtiene el token de recuperación vigente de un usuario.
--
-- La búsqueda es POR USUARIO, no por código. La versión anterior buscaba solo
-- por codigo_verificacion, de modo que un código acertado al azar servía para
-- cualquier cuenta sin saber de quién era.
--
-- Parámetros:
-- $1 = cedula_usuario

SELECT
    prt.id_token,
    prt.cedula_usuario,
    prt.codigo_verificacion,
    prt.fecha_expiracion,
    prt.usado,
    prt.intentos,
    prt.fecha_creacion,
    u.correo_electronico,
    u.nombres,
    u.apellidos
FROM password_reset_tokens prt
INNER JOIN usuarios u ON prt.cedula_usuario = u.cedula
WHERE prt.cedula_usuario = $1
  AND prt.usado = FALSE
  AND prt.fecha_expiracion > (now() AT TIME ZONE 'America/Caracas')
ORDER BY prt.fecha_creacion DESC
LIMIT 1;
