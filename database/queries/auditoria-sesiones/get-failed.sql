SELECT 
    s.id_sesion,
    s.cedula_usuario,
    to_char(s.fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_inicio,
    to_char(s.fecha_cierre, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_cierre,
    s.ip_direccion,
    s.dispositivo,
    s.exitoso,
    u.nombres, 
    u.apellidos, 
    u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.exitoso = FALSE
    AND ($4::text IS NULL OR s.cedula_usuario = $4)
    AND ($5::timestamp IS NULL OR s.fecha_inicio >= $5)
    AND ($6::timestamp IS NULL OR s.fecha_inicio <= $6)
ORDER BY 
    CASE WHEN $3 = 'asc' THEN s.fecha_inicio END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN s.fecha_inicio END DESC
LIMIT $1 OFFSET $2;
