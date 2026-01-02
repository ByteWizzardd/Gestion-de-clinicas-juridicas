-- Obtener todas las citas actualizadas con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_actualizo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en num_cita, id_caso
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    -- Valores anteriores
    a.fecha_encuentro_anterior,
    a.fecha_proxima_cita_anterior,
    a.orientacion_anterior,
    -- Valores nuevos
    a.fecha_encuentro_nueva,
    a.fecha_proxima_cita_nueva,
    a.orientacion_nueva,
    -- Información de auditoría
    a.id_usuario_actualizo,
    u_actualizo.nombres AS nombres_usuario_actualizo,
    u_actualizo.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u_actualizo.nombres, ' ', u_actualizo.apellidos) AS nombre_completo_usuario_actualizo,
    a.fecha_actualizacion
FROM auditoria_actualizacion_citas a
LEFT JOIN usuarios u_actualizo ON a.id_usuario_actualizo = u_actualizo.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.num_cita::TEXT ILIKE '%' || $4 || '%'
        OR a.id_caso::TEXT ILIKE '%' || $4 || '%'
    )
ORDER BY a.fecha_actualizacion DESC, a.num_cita DESC;
