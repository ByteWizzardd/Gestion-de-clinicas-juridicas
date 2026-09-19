-- Invalida los códigos anteriores de un usuario al emitirle uno nuevo.
-- Evita que queden varios códigos válidos a la vez para la misma cuenta.
-- Parámetros:
-- $1 = cedula_usuario

UPDATE password_reset_tokens
SET usado = TRUE
WHERE cedula_usuario = $1
  AND usado = FALSE;
