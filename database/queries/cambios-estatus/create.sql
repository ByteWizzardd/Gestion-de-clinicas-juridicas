-- Registrar un cambio de estatus para un caso
-- Parámetros:
--   $1 = id_caso (ID del caso)
--   $2 = nuevo_estatus (nuevo estatus del caso)
--   $3 = id_usuario_cambia (cédula del usuario que registra el cambio)
--   $4 = motivo (opcional, puede ser NULL)
--   $5 = num_cambio (número de cambio, se calcula automáticamente si es NULL)
-- Nota: fecha se establece automáticamente con CURRENT_DATE si es NULL
INSERT INTO cambio_estatus (
    num_cambio,
    id_caso,
    nuevo_estatus,
    id_usuario_cambia,
    motivo,
    fecha
)
SELECT 
    COALESCE($5, COALESCE(MAX(num_cambio), 0) + 1),
    $1,
    $2,
    $3,
    $4,
    COALESCE(CURRENT_DATE, CURRENT_DATE)
FROM cambio_estatus
WHERE id_caso = $1
RETURNING *;

