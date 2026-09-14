-- Obtener la URL del documento de un soporte específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
--
-- Los documentos viven en Vercel Blob; la BD solo guarda la URL.
SELECT
    s.url_documento,
    s.nombre_archivo,
    s.tipo_mime
FROM soportes s
WHERE s.id_caso = $1 AND s.num_soporte = $2;
