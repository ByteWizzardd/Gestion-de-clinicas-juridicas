-- Registrar un cambio de estatus para un caso
-- Parámetros:
--   $1 = cedula_usuario (cédula del usuario/estudiante que registra el cambio)
--   $2 = id_caso (ID del caso)
--   $3 = estatus_nuevo (nuevo estatus del caso)
-- Nota: fecha_cambio se establece automáticamente con CURRENT_TIMESTAMP
INSERT INTO cambios_estatus (
    cedula_usuario,
    id_caso,
    estatus_nuevo,
    fecha_cambio
) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
RETURNING *;

