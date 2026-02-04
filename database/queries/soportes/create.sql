-- Crear un nuevo soporte para un caso
-- Parámetros:
--   $1 = id_caso
--   $2 = url_documento (VARCHAR - URL de Vercel Blob)
--   $3 = nombre_archivo
--   $4 = tipo_mime
--   $5 = descripcion (opcional, puede ser NULL)
--   $6 = fecha_consignacion (si es NULL, se usa la fecha/hora actual)
--   $7 = id_usuario_subio (cedula del usuario que sube el archivo)
-- 
-- Nota: num_soporte se calcula como el siguiente número disponible para ese caso
INSERT INTO soportes (
    num_soporte,
    id_caso,
    url_documento,
    nombre_archivo,
    tipo_mime,
    descripcion,
    fecha_consignacion,
    id_usuario_subio
)
SELECT 
    COALESCE(MAX(num_soporte), 0) + 1,
    $1,
    $2,
    $3,
    $4,
    $5,
    COALESCE($6, (NOW() AT TIME ZONE 'America/Caracas')),
    $7
FROM soportes
WHERE id_caso = $1
RETURNING *;
