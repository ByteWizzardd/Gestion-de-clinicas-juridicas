-- Archivar un caso (cambiar estatus a 'Archivado')
-- Este query es usado por la función de archivo masivo
-- Parámetros:
--   $1 = id_caso
--   $2 = id_usuario_cambia
--   $3 = motivo

-- Insertar el cambio de estatus
INSERT INTO cambio_estatus (
    num_cambio,
    id_caso,
    nuevo_estatus,
    id_usuario_cambia,
    motivo
)
SELECT 
    COALESCE(MAX(num_cambio), 0) + 1,
    $1,
    'Archivado',
    $2,
    $3
FROM cambio_estatus
WHERE id_caso = $1
RETURNING *;

