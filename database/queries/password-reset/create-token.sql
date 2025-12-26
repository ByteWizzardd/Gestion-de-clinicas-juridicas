-- Crear un nuevo token de recuperación de contraseña
-- Parámetros:
-- $1 = cedula_usuario
-- $2 = codigo_verificacion
-- $3 = fecha_expiracion

INSERT INTO password_reset_tokens (
    cedula_usuario,
    codigo_verificacion,
    fecha_expiracion,
    usado,
    fecha_creacion
)
VALUES ($1, $2, $3, FALSE, CURRENT_DATE)
RETURNING *;

