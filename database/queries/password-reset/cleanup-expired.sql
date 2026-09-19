-- Limpiar tokens expirados o usados (para mantenimiento)
-- Elimina tokens que:
-- - Ya expiraron, o ya fueron usados
-- - Tienen más de 7 días de antigüedad

DELETE FROM password_reset_tokens
WHERE (fecha_expiracion < (now() AT TIME ZONE 'America/Caracas') OR usado = TRUE)
  AND fecha_creacion < (now() AT TIME ZONE 'America/Caracas') - INTERVAL '7 days';
