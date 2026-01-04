-- Obtener todos los estados eliminados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_elimino (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en id_estado, nombre_estado
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.id_estado,
    a.nombre_estado,
    a.habilitado,
    a.fecha_eliminacion,
    a.id_usuario_elimino,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    u.foto_perfil AS foto_perfil_usuario_elimino,
    a.motivo
FROM auditoria_eliminacion_estados a
LEFT JOIN usuarios u ON a.id_usuario_elimino = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_estado::TEXT ILIKE '%' || $4 || '%'
        OR a.nombre_estado ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_eliminacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_eliminacion END ASC NULLS FIRST;
