-- Obtener todas las actualizaciones de municipios con filtros opcionales
SELECT 
    a.id,
    a.id_estado,
    a.num_municipio,
    a.nombre_municipio_anterior,
    a.nombre_municipio_nuevo,
    a.habilitado_anterior,
    a.habilitado_nuevo,
    
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_municipios a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_estado::TEXT ILIKE '%' || $4 || '%'
        OR a.num_municipio::TEXT ILIKE '%' || $4 || '%'
        OR a.nombre_municipio_anterior ILIKE '%' || $4 || '%'
        OR a.nombre_municipio_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
