-- Insertar un registro en ejecutan (usuario que ejecutó una acción)
-- Parámetros:
--   $1 = id_usuario_ejecuta (cédula del usuario que ejecutó)
--   $2 = num_accion (número de acción)
--   $3 = id_caso (ID del caso)
--   $4 = fecha_ejecucion (fecha en que se ejecutó la acción)
INSERT INTO ejecutan (
    id_usuario_ejecuta,
    num_accion,
    id_caso,
    fecha_ejecucion
)
VALUES ($1, $2, $3, $4)
RETURNING *;