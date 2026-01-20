-- Eliminar notificaciones más antiguas que un intervalo dado 
-- Parámetro:
--   $1: cantidad de días (int) => 30.
DELETE FROM notificaciones
WHERE fecha < NOW() - make_interval(days => ($1::int));
