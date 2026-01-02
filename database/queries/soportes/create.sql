-- Crear un nuevo soporte para un caso
-- Parámetros:
--   $1 = id_caso
--   $2 = documento_data (BYTEA)
--   $3 = nombre_archivo
--   $4 = tipo_mime
--   $5 = descripcion (opcional, puede ser NULL)
--   $6 = fecha_consignacion (si es NULL, se usa CURRENT_DATE)
--   $7 = id_usuario_subio (cedula del usuario que sube el archivo)
-- 
-- Nota: num_soporte se calcula como el siguiente número disponible para ese caso
INSERT INTO soportes (
    num_soporte,
    id_caso,
    documento_data,
    nombre_archivo,
    tipo_mime,
    descripcion,
    fecha_consignacion,
    id_usuario_subio,
    fecha_subida
)
SELECT 
    COALESCE(MAX(num_soporte), 0) + 1,
    $1,
    $2,
    $3,
    $4,
    $5,
    COALESCE($6, CURRENT_DATE),
    $7,
    CURRENT_DATE
FROM soportes
WHERE id_caso = $1
RETURNING *;

