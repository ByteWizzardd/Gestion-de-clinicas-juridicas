-- Verifica si existe una notificación (leída o no) para un receptor con el mismo título y mensaje.
-- Esto evita acumular notificaciones idénticas si el usuario no las ha revisado.
-- Parámetros: 
-- $1 = cedula_receptor
-- $2 = titulo
-- $3 = mensaje

SELECT 1 
FROM notificaciones 
WHERE cedula_receptor = $1 
  AND titulo = $2 
  AND mensaje = $3
LIMIT 1;
