SELECT COUNT(*) as count 
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE 
    s.exitoso = TRUE AND
    (s.cedula_usuario ILIKE '%' || $1 || '%' OR
     u.nombres ILIKE '%' || $1 || '%' OR
     u.apellidos ILIKE '%' || $1 || '%' OR
     u.nombre_usuario ILIKE '%' || $1 || '%' OR
     s.ip_direccion ILIKE '%' || $1 || '%' OR
     s.dispositivo ILIKE '%' || $1 || '%')
    AND ($2::text IS NULL OR s.cedula_usuario = $2)
    AND ($3::timestamp IS NULL OR s.fecha_inicio >= $3)
    AND ($4::timestamp IS NULL OR s.fecha_inicio <= $4);
