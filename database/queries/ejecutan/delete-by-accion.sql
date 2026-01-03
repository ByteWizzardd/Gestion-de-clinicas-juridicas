-- Eliminar todos los ejecutores de una acción específica
-- Parámetros:
--   $1 = num_accion
--   $2 = id_caso
DELETE FROM ejecutan
WHERE num_accion = $1::INTEGER
  AND id_caso = $2::INTEGER;