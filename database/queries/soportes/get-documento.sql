-- Obtener el documento_data de un soporte específico
-- Parámetros: $1 = id_caso, $2 = num_soporte
SELECT 
    s.documento_data,
    s.nombre_archivo,
    s.tipo_mime
FROM soportes s
WHERE s.id_caso = $1 AND s.num_soporte = $2;
