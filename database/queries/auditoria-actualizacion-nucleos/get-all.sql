-- Obtener todas las actualizaciones de nucleos con filtros opcionales
SELECT 
    a.id,
    a.id_nucleo,
    a.nombre_nucleo_anterior,
    a.nombre_nucleo_nuevo,
    a.habilitado_anterior,
    a.habilitado_nuevo,
    a.id_estado_anterior,
    a.id_estado_nuevo,
    a.num_municipio_anterior,
    a.num_municipio_nuevo,
    a.num_parroquia_anterior,
    a.num_parroquia_nuevo,
    -- Nombres de estado anterior y nuevo
    e_anterior.nombre_estado AS nombre_estado_anterior,
    e_nuevo.nombre_estado AS nombre_estado_nuevo,
    -- Nombres de municipio anterior y nuevo
    m_anterior.nombre_municipio AS nombre_municipio_anterior,
    m_nuevo.nombre_municipio AS nombre_municipio_nuevo,
    -- Nombres de parroquia anterior y nuevo
    p_anterior.nombre_parroquia AS nombre_parroquia_anterior,
    p_nuevo.nombre_parroquia AS nombre_parroquia_nuevo,
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_nucleos a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
LEFT JOIN estados e_anterior ON a.id_estado_anterior = e_anterior.id_estado
LEFT JOIN estados e_nuevo ON a.id_estado_nuevo = e_nuevo.id_estado
LEFT JOIN municipios m_anterior ON a.id_estado_anterior = m_anterior.id_estado AND a.num_municipio_anterior = m_anterior.num_municipio
LEFT JOIN municipios m_nuevo ON a.id_estado_nuevo = m_nuevo.id_estado AND a.num_municipio_nuevo = m_nuevo.num_municipio
LEFT JOIN parroquias p_anterior ON a.id_estado_anterior = p_anterior.id_estado AND a.num_municipio_anterior = p_anterior.num_municipio AND a.num_parroquia_anterior = p_anterior.num_parroquia
LEFT JOIN parroquias p_nuevo ON a.id_estado_nuevo = p_nuevo.id_estado AND a.num_municipio_nuevo = p_nuevo.num_municipio AND a.num_parroquia_nuevo = p_nuevo.num_parroquia
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_nucleo::TEXT ILIKE '%' || $4 || '%'
        OR a.nombre_nucleo_anterior ILIKE '%' || $4 || '%'
        OR a.nombre_nucleo_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
