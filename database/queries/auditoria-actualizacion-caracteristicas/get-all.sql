-- Obtener todas las actualizaciones de caracteristicas con filtros opcionales
SELECT 
    a.id,
    a.id_tipo_caracteristica,
    a.num_caracteristica,
    a.descripcion_anterior,
    a.descripcion_nuevo,
    a.habilitado_anterior,
    a.habilitado_nuevo,
    t.nombre_tipo_caracteristica,
    
    to_char(a.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_caracteristicas a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
LEFT JOIN tipo_caracteristicas t ON a.id_tipo_caracteristica = t.id_tipo
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_tipo_caracteristica::TEXT ILIKE '%' || $4 || '%'
        OR a.num_caracteristica::TEXT ILIKE '%' || $4 || '%'
        OR a.descripcion_anterior ILIKE '%' || $4 || '%'
        OR a.descripcion_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
