-- Obtener todos los usuarios eliminados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = eliminado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en usuario_eliminado, motivo
SELECT 
    a.id,
    a.usuario_eliminado,
    a.eliminado_por,
    a.motivo,
    a.fecha
FROM auditoria_eliminacion_usuario a
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.eliminado_por = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.usuario_eliminado ILIKE '%' || $4 || '%'
        OR a.motivo ILIKE '%' || $4 || '%'
    )
ORDER BY a.fecha DESC;
