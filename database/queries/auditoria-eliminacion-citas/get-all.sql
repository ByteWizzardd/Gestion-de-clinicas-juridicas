-- Obtener todas las citas eliminadas con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_elimino (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en num_cita, id_caso, orientacion
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    a.fecha_encuentro,
    a.fecha_proxima_cita,
    a.orientacion,
    a.fecha_eliminacion,
    -- Información de auditoría: usuario que registró la cita
    a.id_usuario_registro,
    u_registro.nombres AS nombres_usuario_registro,
    u_registro.apellidos AS apellidos_usuario_registro,
    CONCAT(u_registro.nombres, ' ', u_registro.apellidos) AS nombre_completo_usuario_registro,
    -- Información de auditoría: usuario que eliminó
    a.id_usuario_elimino,
    u_elimino.nombres AS nombres_usuario_elimino,
    u_elimino.apellidos AS apellidos_usuario_elimino,
    CONCAT(u_elimino.nombres, ' ', u_elimino.apellidos) AS nombre_completo_usuario_elimino,
    -- Motivo de la eliminación
    a.motivo
FROM auditoria_eliminacion_citas a
LEFT JOIN usuarios u_registro ON a.id_usuario_registro = u_registro.cedula
LEFT JOIN usuarios u_elimino ON a.id_usuario_elimino = u_elimino.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.num_cita::TEXT ILIKE '%' || $4 || '%'
        OR a.id_caso::TEXT ILIKE '%' || $4 || '%'
        OR a.orientacion ILIKE '%' || $4 || '%'
    )
ORDER BY a.fecha_eliminacion DESC, a.num_cita DESC;
