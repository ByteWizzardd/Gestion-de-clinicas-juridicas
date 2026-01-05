-- Obtener todos los caracteristicas eliminados con filtros opcionales
SELECT 
    a.id,
    a.id_tipo_caracteristica,
    a.num_caracteristica,
    a.descripcion,
    a.habilitado,
    t.nombre_tipo_caracteristica,
    
    a.fecha_eliminacion,
    a.id_usuario_elimino,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    u.foto_perfil AS foto_perfil_usuario_elimino,
    a.motivo
FROM auditoria_eliminacion_caracteristicas a
LEFT JOIN usuarios u ON a.id_usuario_elimino = u.cedula
LEFT JOIN tipo_caracteristicas t ON a.id_tipo_caracteristica = t.id_tipo
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_tipo_caracteristica::TEXT ILIKE '%' || $4 || '%'
        OR a.num_caracteristica::TEXT ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_eliminacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_eliminacion END ASC NULLS FIRST;
