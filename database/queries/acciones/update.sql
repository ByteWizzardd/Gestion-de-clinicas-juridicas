-- Actualizar una acción específica
-- Parámetros:
--   $1 = num_accion
--   $2 = id_caso
--   $3 = nuevo_detalle_accion
--   $4 = nuevo_comentario (puede ser NULL)
UPDATE acciones
SET detalle_accion = $3::TEXT,
    comentario = $4::TEXT
WHERE num_accion = $1::INTEGER
  AND id_caso = $2::INTEGER;