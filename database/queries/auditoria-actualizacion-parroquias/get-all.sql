-- Obtener todas las actualizaciones de parroquias con filtros opcionales
SELECT 
    a.id,
    a.id_estado,
    a.num_municipio,
    a.num_parroquia,
    a.nombre_parroquia_anterior,
    a.nombre_parroquia_nuevo,
    a.habilitado_anterior,
    a.habilitado_nuevo,
    a.id_estado_anterior,
    a.id_estado_nuevo,
    a.num_municipio_anterior,
    a.num_municipio_nuevo,
    -- Nombres de estado anterior y nuevo
    e_anterior.nombre_estado AS nombre_estado_anterior,
    e_nuevo.nombre_estado AS nombre_estado_nuevo,
    -- Nombres de municipio anterior y nuevo
    m_anterior.nombre_municipio AS nombre_municipio_anterior,
    m_nuevo.nombre_municipio AS nombre_municipio_nuevo,
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_parroquias a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
LEFT JOIN estados e_anterior ON a.id_estado_anterior = e_anterior.id_estado
LEFT JOIN estados e_nuevo ON a.id_estado_nuevo = e_nuevo.id_estado
LEFT JOIN municipios m_anterior ON a.id_estado_anterior = m_anterior.id_estado AND a.num_municipio_anterior = m_anterior.num_municipio
LEFT JOIN municipios m_nuevo ON a.id_estado_nuevo = m_nuevo.id_estado AND a.num_municipio_nuevo = m_nuevo.num_municipio
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_estado::TEXT ILIKE '%' || $4 || '%'
        OR a.num_municipio::TEXT ILIKE '%' || $4 || '%'
        OR a.num_parroquia::TEXT ILIKE '%' || $4 || '%'
        OR a.nombre_parroquia_anterior ILIKE '%' || $4 || '%'
        OR a.nombre_parroquia_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
