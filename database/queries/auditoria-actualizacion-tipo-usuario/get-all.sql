-- Obtener todos los cambios de tipo de usuario con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = actualizado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en ci_usuario, tipo_usuario_anterior, tipo_usuario_nuevo
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.ci_usuario,
    u.nombres AS nombres_usuario,
    u.apellidos AS apellidos_usuario,
    CASE 
        WHEN u.nombres IS NOT NULL AND u.apellidos IS NOT NULL 
        THEN u.nombres || ' ' || u.apellidos
        WHEN u.nombres IS NOT NULL 
        THEN u.nombres
        WHEN u.apellidos IS NOT NULL 
        THEN u.apellidos
        ELSE NULL
    END AS nombre_completo_usuario,
    a.tipo_usuario_anterior,
    a.tipo_usuario_nuevo,
    a.actualizado_por,
    u_actualizo.nombres AS nombres_actualizado_por,
    u_actualizo.apellidos AS apellidos_actualizado_por,
    CASE 
        WHEN u_actualizo.nombres IS NOT NULL AND u_actualizo.apellidos IS NOT NULL 
        THEN u_actualizo.nombres || ' ' || u_actualizo.apellidos
        WHEN u_actualizo.nombres IS NOT NULL 
        THEN u_actualizo.nombres
        WHEN u_actualizo.apellidos IS NOT NULL 
        THEN u_actualizo.apellidos
        ELSE NULL
    END AS nombre_completo_actualizado_por,
    a.fecha
FROM auditoria_actualizacion_tipo_usuario a
LEFT JOIN usuarios u ON TRIM(a.ci_usuario) = TRIM(u.cedula)
LEFT JOIN usuarios u_actualizo ON TRIM(a.actualizado_por) = TRIM(u_actualizo.cedula)
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.actualizado_por = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.ci_usuario ILIKE '%' || $4 || '%'
        OR a.tipo_usuario_anterior ILIKE '%' || $4 || '%'
        OR a.tipo_usuario_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha END ASC NULLS FIRST;
