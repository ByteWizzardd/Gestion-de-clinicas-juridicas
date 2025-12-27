-- Crear una nueva acción para un caso
-- Parámetros:
--   $1 = id_caso (ID del caso)
--   $2 = detalle_accion (detalle de la acción)
--   $3 = comentario (opcional, puede ser NULL)
--   $4 = id_usuario_registra (cédula del usuario que registra la acción)
--   $5 = num_accion (número de acción, se calcula automáticamente si es NULL)
-- Nota: fecha_registro se establece automáticamente con CURRENT_DATE
INSERT INTO acciones (
    num_accion,
    id_caso,
    detalle_accion,
    comentario,
    id_usuario_registra,
    fecha_registro
)
SELECT 
    COALESCE($5, COALESCE(MAX(num_accion), 0) + 1),
    $1,
    $2,
    $3,
    $4,
    CURRENT_DATE
FROM acciones
WHERE id_caso = $1
RETURNING *;