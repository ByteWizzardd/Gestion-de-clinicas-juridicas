SELECT s.*, u.nombres, u.apellidos, u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.exitoso = TRUE
ORDER BY 
    CASE WHEN $3 = 'asc' THEN s.fecha_inicio END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN s.fecha_inicio END DESC
LIMIT $1 OFFSET $2;
