-- Obtener todas las actualizaciones de usuarios con filtros opcionales
-- IMPORTANTE: Los datos vienen de la tabla de auditoría, NO de usuarios
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_actualizo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en ci_usuario, nombres, apellidos, correo_electronico, nombre_usuario
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.ci_usuario,
    -- Información del usuario actualizado (desde la tabla de auditoría)
    a.nombres_nuevo AS nombres_usuario,
    a.apellidos_nuevo AS apellidos_usuario,
    CASE 
        WHEN a.nombres_nuevo IS NOT NULL AND a.apellidos_nuevo IS NOT NULL 
        THEN a.nombres_nuevo || ' ' || a.apellidos_nuevo
        WHEN a.nombres_nuevo IS NOT NULL 
        THEN a.nombres_nuevo
        WHEN a.apellidos_nuevo IS NOT NULL 
        THEN a.apellidos_nuevo
        ELSE NULL
    END AS nombre_completo_usuario,
    u.foto_perfil AS foto_perfil_usuario,
    -- Valores anteriores
    a.nombres_anterior,
    a.apellidos_anterior,
    a.correo_electronico_anterior,
    a.nombre_usuario_anterior,
    a.telefono_celular_anterior,
    a.habilitado_sistema_anterior,
    a.tipo_usuario_anterior,
    a.tipo_estudiante_anterior,
    a.tipo_profesor_anterior,
    -- Valores nuevos
    a.nombres_nuevo,
    a.apellidos_nuevo,
    a.correo_electronico_nuevo,
    a.nombre_usuario_nuevo,
    a.telefono_celular_nuevo,
    a.habilitado_sistema_nuevo,
    a.tipo_usuario_nuevo,
    a.tipo_estudiante_nuevo,
    a.tipo_profesor_nuevo,
    -- Información de auditoría
    a.id_usuario_actualizo,
    COALESCE(u_actualizo.nombres, au_actor.nombres) AS nombres_usuario_actualizo,
    COALESCE(u_actualizo.apellidos, au_actor.apellidos) AS apellidos_usuario_actualizo,
    CASE 
        WHEN COALESCE(u_actualizo.nombres, au_actor.nombres) IS NOT NULL AND COALESCE(u_actualizo.apellidos, au_actor.apellidos) IS NOT NULL 
        THEN COALESCE(u_actualizo.nombres, au_actor.nombres) || ' ' || COALESCE(u_actualizo.apellidos, au_actor.apellidos)
        WHEN COALESCE(u_actualizo.nombres, au_actor.nombres) IS NOT NULL 
        THEN COALESCE(u_actualizo.nombres, au_actor.nombres)
        WHEN COALESCE(u_actualizo.apellidos, au_actor.apellidos) IS NOT NULL 
        THEN COALESCE(u_actualizo.apellidos, au_actor.apellidos)
        ELSE NULL
    END AS nombre_completo_usuario_actualizo,
    u_actualizo.foto_perfil AS foto_perfil_usuario_actualizo,
    to_char(a.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_actualizacion
FROM auditoria_actualizacion_usuarios a
LEFT JOIN usuarios u ON TRIM(a.ci_usuario) = TRIM(u.cedula)
LEFT JOIN usuarios u_actualizo ON TRIM(a.id_usuario_actualizo) = TRIM(u_actualizo.cedula)
LEFT JOIN (
    SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
    FROM public.auditoria_insercion_usuarios
    ORDER BY cedula, fecha_creacion DESC
) au_actor ON TRIM(a.id_usuario_actualizo) = TRIM(au_actor.cedula)
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.ci_usuario ILIKE '%' || $4 || '%'
        OR a.nombres_anterior ILIKE '%' || $4 || '%'
        OR a.nombres_nuevo ILIKE '%' || $4 || '%'
        OR a.apellidos_anterior ILIKE '%' || $4 || '%'
        OR a.apellidos_nuevo ILIKE '%' || $4 || '%'
        OR a.correo_electronico_anterior ILIKE '%' || $4 || '%'
        OR a.correo_electronico_nuevo ILIKE '%' || $4 || '%'
        OR a.nombre_usuario_anterior ILIKE '%' || $4 || '%'
        OR a.nombre_usuario_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
