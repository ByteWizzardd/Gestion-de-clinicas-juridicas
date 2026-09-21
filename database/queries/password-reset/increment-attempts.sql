-- Suma un intento fallido a un token de recuperación.
-- Parámetros:
-- $1 = id_token

UPDATE password_reset_tokens
SET intentos = intentos + 1
WHERE id_token = $1
RETURNING intentos;
