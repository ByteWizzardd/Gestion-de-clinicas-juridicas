-- Consume un token de recuperación: lo marca usado y devuelve la fila, pero
-- SOLO si sigue vigente y sin usar.
--
-- Es un compare-and-swap: la condición y la escritura ocurren en la misma
-- sentencia, así que dos peticiones simultáneas con el mismo comprobante no
-- pueden consumirlo las dos. Si no devuelve fila, el token ya no servía.
--
-- Parámetros:
-- $1 = id_token
-- $2 = cedula_usuario

UPDATE password_reset_tokens
SET usado = TRUE
WHERE id_token = $1
  AND cedula_usuario = $2
  AND usado = FALSE
  AND fecha_expiracion > (now() AT TIME ZONE 'America/Caracas')
RETURNING id_token, cedula_usuario;
