-- Marcar una notificación como leída (solo para el receptor)
UPDATE notificaciones
SET leida = TRUE
WHERE id_notificacion = $1
  AND cedula_receptor = $2
RETURNING id_notificacion;
