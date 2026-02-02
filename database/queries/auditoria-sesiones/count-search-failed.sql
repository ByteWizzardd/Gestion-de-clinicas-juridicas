SELECT COUNT(*) as count 
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.exitoso = FALSE AND
    (s.cedula_usuario ILIKE '%' || $1 || '%' OR
     u.nombres ILIKE '%' || $1 || '%' OR
     u.apellidos ILIKE '%' || $1 || '%' OR
     u.nombre_usuario ILIKE '%' || $1 || '%' OR
     s.ip_direccion ILIKE '%' || $1 || '%' OR
     s.dispositivo ILIKE '%' || $1 || '%');
