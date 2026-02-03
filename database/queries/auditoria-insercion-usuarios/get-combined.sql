-- Obtener todos los registros de inserción combinados (usuarios, estudiantes, profesores)
-- IMPORTANTE: Los datos se toman de las tablas de auditoría, NO de usuarios
SELECT * FROM (
    -- 1. Usuarios Creados (datos de auditoria_insercion_usuarios)
    SELECT 
        au.id::text || '-user' as unique_id,
        au.id,
        'usuario-creado' as tipo_registro,
        au.cedula,
        au.nombres,
        au.apellidos,
        au.correo_electronico,
        au.nombre_usuario,
        au.telefono_celular,
        au.tipo_usuario,
        au.tipo_estudiante,
        au.tipo_profesor,
        NULL::varchar as term,
        au.habilitado_sistema,
        NULL::varchar as nrc,
        to_char(au.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
        au.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        NULL::bytea AS foto_perfil_usuario
    FROM public.auditoria_insercion_usuarios au
    LEFT JOIN public.usuarios uc ON au.id_usuario_creo = uc.cedula

    UNION ALL

    -- 2. Estudiantes Inscritos (datos de auditoria_insercion_estudiantes + usuarios para datos básicos)
    SELECT 
        ae.id::text || '-student' as unique_id,
        ae.id,
        'estudiante-inscrito' as tipo_registro,
        ae.cedula_estudiante as cedula,
        u.nombres,
        u.apellidos,
        u.correo_electronico,
        u.nombre_usuario,
        u.telefono_celular,
        u.tipo_usuario,
        ae.tipo_estudiante,
        NULL::varchar as tipo_profesor,
        ae.term,
        u.habilitado_sistema,
        ae.nrc,
        to_char(ae.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
        ae.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_estudiantes ae
    LEFT JOIN public.usuarios u ON ae.cedula_estudiante = u.cedula
    LEFT JOIN public.usuarios uc ON ae.id_usuario_creo = uc.cedula

    UNION ALL

    -- 3. Profesores Asignados (datos de auditoria_insercion_profesores + usuarios para datos básicos)
    SELECT 
        ap.id::text || '-prof' as unique_id,
        ap.id,
        'profesor-asignado' as tipo_registro,
        ap.cedula_profesor as cedula,
        u.nombres,
        u.apellidos,
        u.correo_electronico,
        u.nombre_usuario,
        u.telefono_celular,
        u.tipo_usuario,
        NULL::varchar as tipo_estudiante,
        ap.tipo_profesor,
        NULL::varchar as term,
        u.habilitado_sistema,
        NULL::varchar as nrc,
        to_char(ap.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
        ap.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_profesores ap
    LEFT JOIN public.usuarios u ON ap.cedula_profesor = u.cedula
    LEFT JOIN public.usuarios uc ON ap.id_usuario_creo = uc.cedula
) AS combined_records
WHERE 
    ($1::DATE IS NULL OR combined_records.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR combined_records.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR combined_records.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR combined_records.nombres ILIKE '%' || $4 || '%'
        OR combined_records.apellidos ILIKE '%' || $4 || '%'
        OR combined_records.cedula ILIKE '%' || $4 || '%'
        OR combined_records.correo_electronico ILIKE '%' || $4 || '%'
        OR combined_records.nombre_usuario ILIKE '%' || $4 || '%'
    )
    AND ($6::TEXT IS NULL OR combined_records.tipo_registro = $6)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN combined_records.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN combined_records.fecha_creacion END ASC NULLS FIRST;
