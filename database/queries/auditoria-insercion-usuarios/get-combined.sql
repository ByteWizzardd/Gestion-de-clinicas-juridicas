-- Obtener todos los registros de inserción combinados (usuarios, estudiantes, profesores)
-- IMPORTANTE: Los datos se toman de las tablas de auditoría, NO de usuarios
-- NOTA: Se excluyen los registros de "usuario-creado" cuando existe un registro más específico
--       (estudiante-inscrito o profesor-asignado) para la misma cédula en el mismo momento.
SELECT * FROM (
    -- 1. Usuarios Creados (solo si NO tienen registro de estudiante o profesor en el mismo momento)
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
        COALESCE(uc.nombres, au_actor.nombres) AS nombres_usuario_creo,
        COALESCE(uc.apellidos, au_actor.apellidos) AS apellidos_usuario_creo,
        COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), CONCAT(au_actor.nombres, ' ', au_actor.apellidos)) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        NULL::varchar AS foto_perfil_usuario
    FROM public.auditoria_insercion_usuarios au
    LEFT JOIN public.usuarios uc ON au.id_usuario_creo = uc.cedula
    LEFT JOIN (
        SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
        FROM public.auditoria_insercion_usuarios
        ORDER BY cedula, fecha_creacion DESC
    ) au_actor ON au.id_usuario_creo = au_actor.cedula
    WHERE NOT EXISTS (
        -- Excluir si hay un registro de estudiante para la misma cédula en los últimos 5 segundos
        SELECT 1 FROM public.auditoria_insercion_estudiantes ae
        WHERE ae.cedula_estudiante = au.cedula
        AND ABS(EXTRACT(EPOCH FROM (ae.fecha_creacion - au.fecha_creacion))) < 5
    )
    AND NOT EXISTS (
        -- Excluir si hay un registro de profesor para la misma cédula en los últimos 5 segundos
        SELECT 1 FROM public.auditoria_insercion_profesores ap
        WHERE ap.cedula_profesor = au.cedula
        AND ABS(EXTRACT(EPOCH FROM (ap.fecha_creacion - au.fecha_creacion))) < 5
    )

    UNION ALL

    -- 2. Estudiantes Inscritos
    SELECT 
        ae.id::text || '-student' as unique_id,
        ae.id,
        'estudiante-inscrito' as tipo_registro,
        ae.cedula_estudiante as cedula,
        COALESCE(u.nombres, au_hist.nombres) as nombres,
        COALESCE(u.apellidos, au_hist.apellidos) as apellidos,
        COALESCE(u.correo_electronico, au_hist.correo_electronico) as correo_electronico,
        COALESCE(u.nombre_usuario, au_hist.nombre_usuario) as nombre_usuario,
        COALESCE(u.telefono_celular, au_hist.telefono_celular) as telefono_celular,
        COALESCE(u.tipo_usuario, au_hist.tipo_usuario) as tipo_usuario,
        ae.tipo_estudiante,
        NULL::varchar as tipo_profesor,
        ae.term,
        COALESCE(u.habilitado_sistema, au_hist.habilitado_sistema) as habilitado_sistema,
        ae.nrc,
        to_char(ae.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
        ae.id_usuario_creo,
        COALESCE(uc.nombres, au_actor.nombres) AS nombres_usuario_creo,
        COALESCE(uc.apellidos, au_actor.apellidos) AS apellidos_usuario_creo,
        COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), CONCAT(au_actor.nombres, ' ', au_actor.apellidos)) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_estudiantes ae
    LEFT JOIN public.usuarios u ON ae.cedula_estudiante = u.cedula
    LEFT JOIN public.auditoria_insercion_usuarios au_hist ON ae.cedula_estudiante = au_hist.cedula 
        AND ABS(EXTRACT(EPOCH FROM (ae.fecha_creacion - au_hist.fecha_creacion))) < 10
    LEFT JOIN public.usuarios uc ON ae.id_usuario_creo = uc.cedula
    LEFT JOIN (
        SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
        FROM public.auditoria_insercion_usuarios
        ORDER BY cedula, fecha_creacion DESC
    ) au_actor ON ae.id_usuario_creo = au_actor.cedula

    UNION ALL

    -- 3. Profesores Asignados
    SELECT 
        ap.id::text || '-prof' as unique_id,
        ap.id,
        'profesor-asignado' as tipo_registro,
        ap.cedula_profesor as cedula,
        COALESCE(u.nombres, au_hist.nombres) as nombres,
        COALESCE(u.apellidos, au_hist.apellidos) as apellidos,
        COALESCE(u.correo_electronico, au_hist.correo_electronico) as correo_electronico,
        COALESCE(u.nombre_usuario, au_hist.nombre_usuario) as nombre_usuario,
        COALESCE(u.telefono_celular, au_hist.telefono_celular) as telefono_celular,
        COALESCE(u.tipo_usuario, au_hist.tipo_usuario) as tipo_usuario,
        NULL::varchar as tipo_estudiante,
        ap.tipo_profesor,
        NULL::varchar as term,
        COALESCE(u.habilitado_sistema, au_hist.habilitado_sistema) as habilitado_sistema,
        NULL::varchar as nrc,
        to_char(ap.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
        ap.id_usuario_creo,
        COALESCE(uc.nombres, au_actor.nombres) AS nombres_usuario_creo,
        COALESCE(uc.apellidos, au_actor.apellidos) AS apellidos_usuario_creo,
        COALESCE(CONCAT(uc.nombres, ' ', uc.apellidos), CONCAT(au_actor.nombres, ' ', au_actor.apellidos)) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_profesores ap
    LEFT JOIN public.usuarios u ON ap.cedula_profesor = u.cedula
    LEFT JOIN public.auditoria_insercion_usuarios au_hist ON ap.cedula_profesor = au_hist.cedula 
        AND ABS(EXTRACT(EPOCH FROM (ap.fecha_creacion - au_hist.fecha_creacion))) < 10
    LEFT JOIN public.usuarios uc ON ap.id_usuario_creo = uc.cedula
    LEFT JOIN (
        SELECT DISTINCT ON (cedula) cedula, nombres, apellidos
        FROM public.auditoria_insercion_usuarios
        ORDER BY cedula, fecha_creacion DESC
    ) au_actor ON ap.id_usuario_creo = au_actor.cedula
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
