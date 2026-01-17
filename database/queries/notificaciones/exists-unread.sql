    -- Verifica si existe una notificación NO LEÍDA para un receptor con el mismo título.
-- Esto evita acumular notificaciones idénticas si el usuario no las ha revisado.
-- Parámetros: 
-- $1 = cedula_receptor
-- $2 = titulo

SELECT 1 
FROM notificaciones 
WHERE cedula_receptor = $1 
  AND titulo = $2 
  AND leida = FALSE
LIMIT 1;
