SELECT s.*, u.nombres, u.apellidos, u.nombre_usuario
FROM auditoria_sesiones s
LEFT JOIN usuarios u ON s.cedula_usuario = u.cedula
WHERE s.fecha_cierre IS NOT NULL
    AND ($4::text IS NULL OR s.cedula_usuario = $4)
    AND ($5::timestamp IS NULL OR s.fecha_inicio >= $5)
    AND ($6::timestamp IS NULL OR s.fecha_inicio <= $6)
ORDER BY 
    CASE WHEN $3 = 'asc' THEN s.fecha_inicio END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN s.fecha_inicio END DESC
LIMIT $1 OFFSET $2;
