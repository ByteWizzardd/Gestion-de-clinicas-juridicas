-- Eliminar una acción específica y todos sus ejecutores
-- Parámetros:
--   $1 = num_accion
--   $2 = id_caso
DELETE FROM acciones
WHERE num_accion = $1::INTEGER
  AND id_caso = $2::INTEGER;