-- Obtener todos los usuarios eliminados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = eliminado_por (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en usuario_eliminado, motivo
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.usuario_eliminado,
    a.nombres_usuario_eliminado,
    a.apellidos_usuario_eliminado,
    CASE 
        WHEN a.nombres_usuario_eliminado IS NOT NULL AND a.apellidos_usuario_eliminado IS NOT NULL 
        THEN a.nombres_usuario_eliminado || ' ' || a.apellidos_usuario_eliminado
        WHEN a.nombres_usuario_eliminado IS NOT NULL 
        THEN a.nombres_usuario_eliminado
        WHEN a.apellidos_usuario_eliminado IS NOT NULL 
        THEN a.apellidos_usuario_eliminado
        ELSE NULL
    END AS nombre_completo_usuario_eliminado,
    a.eliminado_por,
    COALESCE(u_elimino.nombres, au_actor.nombres) AS nombres_eliminado_por,
    COALESCE(u_elimino.apellidos, au_actor.apellidos) AS apellidos_eliminado_por,
    CASE 
        WHEN COALESCE(u_elimino.nombres, au_actor.nombres) IS NOT NULL AND COALESCE(u_elimino.apellidos, au_actor.apellidos) IS NOT NULL 
        THEN COALESCE(u_elimino.nombres, au_actor.nombres) || ' ' || COALESCE(u_elimino.apellidos, au_actor.apellidos)
        WHEN COALESCE(u_elimino.nombres, au_actor.nombres) IS NOT NULL 
        THEN COALESCE(u_elimino.nombres, au_actor.nombres)
        WHEN COALESCE(u_elimino.apellidos, au_actor.apellidos) IS NOT NULL 
        THEN COALESCE(u_elimino.apellidos, au_actor.apellidos)
        ELSE NULL
    END AS nombre_completo_eliminado_por,
    u_elimino.foto_perfil AS foto_perfil_eliminado_por,
    a.motivo,
    to_char(a.fecha, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha
FROM auditoria_eliminacion_usuario a
LEFT JOIN usuarios u_elimino ON TRIM(a.eliminado_por) = TRIM(u_elimino.cedula)
LEFT JOIN (
    SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
    FROM public.auditoria_insercion_usuarios
    ORDER BY cedula, fecha_creacion DESC
) au_actor ON TRIM(a.eliminado_por) = TRIM(au_actor.cedula)
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.eliminado_por = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.usuario_eliminado ILIKE '%' || $4 || '%'
        OR a.motivo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha END ASC NULLS FIRST;
