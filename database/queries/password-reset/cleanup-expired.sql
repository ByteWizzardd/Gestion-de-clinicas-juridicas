-- Limpiar tokens expirados o usados (para mantenimiento)
-- Elimina tokens que:
-- - Ya expiraron (fecha_expiracion < CURRENT_DATE)
-- - Ya fueron usados (usado = TRUE)
-- - Tienen más de 7 días de antigüedad

DELETE FROM password_reset_tokens
WHERE (fecha_expiracion < CURRENT_DATE OR usado = TRUE)
  AND fecha_creacion < CURRENT_DATE - INTERVAL '7 days';

