-- Marcar un token como usado
-- Parámetros:
-- $1 = id_token

UPDATE password_reset_tokens
SET usado = TRUE
WHERE id_token = $1
RETURNING *;

