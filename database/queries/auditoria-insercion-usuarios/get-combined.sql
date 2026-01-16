-- Obtener todos los registros de inserción combinados (usuarios, estudiantes, profesores)
SELECT * FROM (
    -- 1. Usuarios Creados
    SELECT 
        au.id::text || '-user' as unique_id,
        au.id,
        'usuario-creado' as tipo_registro,
        au.cedula,
        u.nombres,
        u.apellidos,
        u.correo_electronico,
        u.nombre_usuario,
        u.telefono_celular,
        u.tipo_usuario,
        NULL as tipo_estudiante,
        NULL as tipo_profesor,
        NULL as term,
        au.fecha_creacion,
        au.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_usuarios au
    JOIN public.usuarios u ON au.cedula = u.cedula
    LEFT JOIN public.usuarios uc ON au.id_usuario_creo = uc.cedula

    UNION ALL

    -- 2. Estudiantes Inscritos
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
        NULL as tipo_profesor,
        ae.term,
        ae.fecha_creacion,
        ae.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_estudiantes ae
    JOIN public.usuarios u ON ae.cedula_estudiante = u.cedula
    LEFT JOIN public.usuarios uc ON ae.id_usuario_creo = uc.cedula

    UNION ALL

    -- 3. Profesores Asignados
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
        NULL as tipo_estudiante,
        ap.tipo_profesor,
        NULL as term,
        ap.fecha_creacion,
        ap.id_usuario_creo,
        uc.nombres AS nombres_usuario_creo,
        uc.apellidos AS apellidos_usuario_creo,
        CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
        uc.foto_perfil AS foto_perfil_usuario_creo,
        u.foto_perfil AS foto_perfil_usuario
    FROM public.auditoria_insercion_profesores ap
    JOIN public.usuarios u ON ap.cedula_profesor = u.cedula
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
