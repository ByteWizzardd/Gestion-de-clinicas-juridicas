SELECT s.*, u.nombres, u.apellidos, u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.fecha_cierre IS NOT NULL
ORDER BY s.fecha_cierre DESC
LIMIT $1 OFFSET $2;
