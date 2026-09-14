-- Obtener la URL del documento de un soporte específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
--
-- Soportes subidos antes de migrar a Vercel Blob no tienen url_documento: el
-- archivo está en la columna vieja documento_data y se devuelve como data URL
-- (DocumentsTab.tsx lo abre como Blob).
SELECT
    COALESCE(
        s.url_documento,
        CASE WHEN s.documento_data IS NOT NULL
             THEN 'data:' || s.tipo_mime || ';base64,' || translate(encode(s.documento_data, 'base64'), E'\n', '')
        END
    ) AS url_documento,
    s.nombre_archivo,
    s.tipo_mime
FROM soportes s
WHERE s.id_caso = $1 AND s.num_soporte = $2;
