SELECT s.*, u.nombres, u.apellidos, u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.exitoso = FALSE
ORDER BY s.fecha_inicio DESC
LIMIT $1 OFFSET $2;
