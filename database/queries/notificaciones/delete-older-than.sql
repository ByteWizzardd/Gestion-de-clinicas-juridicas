-- Eliminar notificaciones más antiguas que un intervalo dado 
-- Parámetro:
--   $1: intervalo PostgreSQL (texto) => '30 days'.
DELETE FROM notificaciones
WHERE fecha < NOW() - ($1::interval)
RETURNING id_notificacion;
