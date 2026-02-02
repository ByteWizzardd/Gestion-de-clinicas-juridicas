SELECT 
    s.*,
    u.nombres,
    u.apellidos,
    u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE 
    s.fecha_cierre IS NOT NULL AND
    (s.cedula_usuario ILIKE '%' || $3 || '%' OR
     u.nombres ILIKE '%' || $3 || '%' OR
     u.apellidos ILIKE '%' || $3 || '%' OR
     u.nombre_usuario ILIKE '%' || $3 || '%' OR
     s.ip_direccion ILIKE '%' || $3 || '%' OR
     s.dispositivo ILIKE '%' || $3 || '%')
    AND ($5::text IS NULL OR s.cedula_usuario = $5)
    AND ($6::timestamp IS NULL OR s.fecha_inicio >= $6)
    AND ($7::timestamp IS NULL OR s.fecha_inicio <= $7)
ORDER BY 
    CASE WHEN $4 = 'asc' THEN s.fecha_inicio END ASC,
    CASE WHEN $4 = 'desc' OR $4 IS NULL THEN s.fecha_inicio END DESC
LIMIT $1 OFFSET $2;
