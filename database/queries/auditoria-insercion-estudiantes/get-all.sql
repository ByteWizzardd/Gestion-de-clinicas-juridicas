-- Obtener todos los estudiantes inscritos (auditoría)
SELECT 
    a.id,
    a.cedula_estudiante as cedula,
    u.nombres,
    u.apellidos,
    u.correo_electronico,
    u.nombre_usuario,
    u.telefono_celular,
    u.tipo_usuario,
    a.tipo_estudiante,
    a.term,
    a.nrc,
    to_char(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
    a.id_usuario_creo,
    uc.nombres AS nombres_usuario_creo,
    uc.apellidos AS apellidos_usuario_creo,
    CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
    uc.foto_perfil AS foto_perfil_usuario_creo
FROM public.auditoria_insercion_estudiantes a
JOIN public.usuarios u ON a.cedula_estudiante = u.cedula
LEFT JOIN public.usuarios uc ON a.id_usuario_creo = uc.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR u.nombres ILIKE '%' || $4 || '%'
        OR u.apellidos ILIKE '%' || $4 || '%'
        OR u.cedula ILIKE '%' || $4 || '%'
        OR u.correo_electronico ILIKE '%' || $4 || '%'
        OR u.nombre_usuario ILIKE '%' || $4 || '%'
        OR a.term ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
