-- Obtener todos los soportes/documentos de un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    s.num_soporte,
    s.id_caso,
    s.nombre_archivo,
    s.tipo_mime,
    s.descripcion,
    s.fecha_consignacion,
    s.url_documento,
    -- Información de auditoría: usuario que subió
    s.id_usuario_subio,
    u_subio.nombres AS nombres_usuario_subio,
    u_subio.apellidos AS apellidos_usuario_subio,
    CONCAT(u_subio.nombres, ' ', u_subio.apellidos) AS nombre_completo_usuario_subio
FROM soportes s
LEFT JOIN usuarios u_subio ON s.id_usuario_subio = u_subio.cedula
WHERE s.id_caso = $1
ORDER BY s.fecha_consignacion DESC, s.num_soporte DESC;
