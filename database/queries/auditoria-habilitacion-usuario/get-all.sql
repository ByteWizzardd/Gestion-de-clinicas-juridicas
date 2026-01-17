-- Obtener todas las habilitaciones de usuarios con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = habilitado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en usuario_habilitado, motivo
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.usuario_habilitado,
    a.nombres_usuario_habilitado,
    a.apellidos_usuario_habilitado,
    CASE 
        WHEN a.nombres_usuario_habilitado IS NOT NULL AND a.apellidos_usuario_habilitado IS NOT NULL 
        THEN a.nombres_usuario_habilitado || ' ' || a.apellidos_usuario_habilitado
        WHEN a.nombres_usuario_habilitado IS NOT NULL 
        THEN a.nombres_usuario_habilitado
        WHEN a.apellidos_usuario_habilitado IS NOT NULL 
        THEN a.apellidos_usuario_habilitado
        ELSE NULL
    END AS nombre_completo_usuario_habilitado,
    a.habilitado_por,
    u_habilito.nombres AS nombres_habilitado_por,
    u_habilito.apellidos AS apellidos_habilitado_por,
    CASE 
        WHEN u_habilito.nombres IS NOT NULL AND u_habilito.apellidos IS NOT NULL 
        THEN u_habilito.nombres || ' ' || u_habilito.apellidos
        WHEN u_habilito.nombres IS NOT NULL 
        THEN u_habilito.nombres
        WHEN u_habilito.apellidos IS NOT NULL 
        THEN u_habilito.apellidos
        ELSE NULL
    END AS nombre_completo_habilitado_por,
    u_habilito.foto_perfil AS foto_perfil_habilitado_por,
    a.motivo,
    a.fecha
FROM auditoria_habilitacion_usuario a
LEFT JOIN usuarios u_habilito ON TRIM(a.habilitado_por) = TRIM(u_habilito.cedula)
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.habilitado_por = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.usuario_habilitado ILIKE '%' || $4 || '%'
        OR a.motivo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha END ASC NULLS FIRST;
