-- Obtener todos los cambios de tipo de usuario con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = actualizado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en ci_usuario, tipo_usuario_anterior, tipo_usuario_nuevo
SELECT 
    a.id,
    a.ci_usuario,
    a.tipo_usuario_anterior,
    a.tipo_usuario_nuevo,
    a.actualizado_por,
    a.fecha
FROM auditoria_actualizacion_tipo_usuario a
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
ORDER BY a.fecha DESC;
