-- Buscar acción relacionada con una cita específica
-- Parámetros:
--   $1 = id_caso
--   $2 = fecha_formateada (DD/MM/YYYY)
--   $3 = orientacion
SELECT
    num_accion,
    id_caso,
    detalle_accion,
    comentario,
    id_usuario_registra,
    fecha_registro
FROM acciones
WHERE id_caso = $1::INTEGER
  AND detalle_accion = 'Cita realizada el ' || $2::TEXT
  AND (comentario = $3::TEXT OR ($3::TEXT IS NULL AND comentario IS NULL))
ORDER BY fecha_registro DESC, num_accion DESC
LIMIT 1;