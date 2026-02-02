SELECT 
    ses.*,
    u.nombres,
    u.apellidos,
    u.nombre_usuario
FROM auditoria_sesiones ses
LEFT JOIN usuarios u ON ses.cedula_usuario = u.cedula
ORDER BY ses.fecha_inicio DESC
LIMIT $1 OFFSET $2;
