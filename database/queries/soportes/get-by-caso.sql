-- Obtener todos los soportes/documentos de un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    s.num_soporte,
    s.id_caso,
    s.nombre_archivo,
    s.tipo_mime,
    s.descripcion,
    s.fecha_consignacion,
    -- No incluir documento_data para evitar cargar archivos grandes innecesariamente
    LENGTH(s.documento_data) AS tamano_bytes
FROM soportes s
WHERE s.id_caso = $1
ORDER BY s.fecha_consignacion DESC, s.num_soporte DESC;

