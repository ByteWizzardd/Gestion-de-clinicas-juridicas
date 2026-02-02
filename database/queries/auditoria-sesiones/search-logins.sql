SELECT s.*, u.nombres, u.apellidos, u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.exitoso = TRUE AND
    (s.cedula_usuario ILIKE '%' || $3 || '%' OR
     u.nombres ILIKE '%' || $3 || '%' OR
     u.apellidos ILIKE '%' || $3 || '%' OR
     u.nombre_usuario ILIKE '%' || $3 || '%' OR
     s.ip_direccion ILIKE '%' || $3 || '%' OR
     s.dispositivo ILIKE '%' || $3 || '%')
ORDER BY s.fecha_inicio DESC
LIMIT $1 OFFSET $2;
