-- Crear un nuevo token de recuperación de contraseña
-- La expiración llega ya calculada como timestamp (hora de Caracas).
-- Parámetros:
-- $1 = cedula_usuario
-- $2 = codigo_verificacion
-- $3 = fecha_expiracion (timestamp)

INSERT INTO password_reset_tokens (
    cedula_usuario,
    codigo_verificacion,
    fecha_expiracion,
    usado,
    intentos,
    fecha_creacion
)
VALUES ($1, $2, $3::timestamp, FALSE, 0, (now() AT TIME ZONE 'America/Caracas'))
RETURNING *;
