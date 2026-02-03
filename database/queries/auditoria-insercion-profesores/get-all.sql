-- Obtener todos los profesores inscritos/asignados (auditoría)
SELECT 
    a.id,
    a.cedula_profesor as cedula,
    COALESCE(u.nombres, au_hist.nombres) as nombres,
    COALESCE(u.apellidos, au_hist.apellidos) as apellidos,
    COALESCE(u.correo_electronico, au_hist.correo_electronico) as correo_electronico,
    COALESCE(u.nombre_usuario, au_hist.nombre_usuario) as nombre_usuario,
    COALESCE(u.telefono_celular, au_hist.telefono_celular) as telefono_celular,
    COALESCE(u.tipo_usuario, au_hist.tipo_usuario) as tipo_usuario,
    a.tipo_profesor,
    to_char(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
    a.id_usuario_creo,
    COALESCE(uc.nombres, au_actor.nombres) AS nombres_usuario_creo,
    COALESCE(uc.apellidos, au_actor.apellidos) AS apellidos_usuario_creo,
    COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), CONCAT(au_actor.nombres, ' ', au_actor.apellidos)) AS nombre_completo_usuario_creo,
    uc.foto_perfil AS foto_perfil_usuario_creo
FROM public.auditoria_insercion_profesores a
LEFT JOIN public.usuarios u ON a.cedula_profesor = u.cedula
LEFT JOIN public.auditoria_insercion_usuarios au_hist ON a.cedula_profesor = au_hist.cedula 
    AND ABS(EXTRACT(EPOCH FROM (a.fecha_creacion - au_hist.fecha_creacion))) < 10
LEFT JOIN public.usuarios uc ON a.id_usuario_creo = uc.cedula
LEFT JOIN (
    SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
    FROM public.auditoria_insercion_usuarios
    ORDER BY cedula, fecha_creacion DESC
) au_actor ON a.id_usuario_creo = au_actor.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR COALESCE(u.nombres, au_hist.nombres) ILIKE '%' || $4 || '%'
        OR COALESCE(u.apellidos, au_hist.apellidos) ILIKE '%' || $4 || '%'
        OR u.cedula ILIKE '%' || $4 || '%'
        OR COALESCE(u.correo_electronico, au_hist.correo_electronico) ILIKE '%' || $4 || '%'
        OR COALESCE(u.nombre_usuario, au_hist.nombre_usuario) ILIKE '%' || $4 || '%'
        OR a.tipo_profesor ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
