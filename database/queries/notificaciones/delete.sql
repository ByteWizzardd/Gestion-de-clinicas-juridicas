-- Eliminar una notificación (solo para el receptor)
DELETE FROM notificaciones
WHERE id_notificacion = $1
  AND cedula_receptor = $2
RETURNING id_notificacion;
