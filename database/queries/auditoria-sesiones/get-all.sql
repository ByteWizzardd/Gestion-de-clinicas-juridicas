SELECT 
    ses.*,
    u.nombres,
    u.apellidos,
    u.nombre_usuario
FROM auditoria_sesiones ses
LEFT JOIN usuarios u ON ses.cedula_usuario = u.cedula
WHERE
    ($4::text IS NULL OR ses.cedula_usuario = $4) AND
    ($5::timestamp IS NULL OR ses.fecha_inicio >= $5) AND
    ($6::timestamp IS NULL OR ses.fecha_inicio <= $6)
ORDER BY 
    CASE WHEN $3 = 'asc' THEN ses.fecha_inicio END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN ses.fecha_inicio END DESC
LIMIT $1 OFFSET $2;
