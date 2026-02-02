-- Obtener todas las citas actualizadas con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_actualizo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en num_cita, id_caso
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    -- Valores anteriores
    a.fecha_encuentro_anterior,
    a.fecha_proxima_cita_anterior,
    a.orientacion_anterior,
    a.atenciones_anterior,
    -- Resolver cédulas anteriores a usuarios con nombre
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'cedula', u_ant.cedula,
                'nombre', u_ant.nombres || ' ' || u_ant.apellidos
            )
        )
        FROM usuarios u_ant
        WHERE u_ant.cedula = ANY(string_to_array(a.atenciones_anterior, ','))),
        '[]'::json
    ) AS usuarios_atenciones_anterior,
    -- Valores nuevos
    a.fecha_encuentro_nueva,
    a.fecha_proxima_cita_nueva,
    a.orientacion_nueva,
    a.atenciones_nuevo,
    -- Resolver cédulas nuevas a usuarios con nombre
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'cedula', u_nue.cedula,
                'nombre', u_nue.nombres || ' ' || u_nue.apellidos
            )
        )
        FROM usuarios u_nue
        WHERE u_nue.cedula = ANY(string_to_array(a.atenciones_nuevo, ','))),
        '[]'::json
    ) AS usuarios_atenciones_nuevo,
    -- Información de auditoría
    a.id_usuario_actualizo,
    u_actualizo.nombres AS nombres_usuario_actualizo,
    u_actualizo.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u_actualizo.nombres, ' ', u_actualizo.apellidos) AS nombre_completo_usuario_actualizo,
    u_actualizo.foto_perfil AS foto_perfil_usuario_actualizo,
    a.fecha_actualizacion,
    -- Información de usuarios que atendieron la cita
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id_usuario', at.id_usuario,
                'nombres', u_at.nombres,
                'apellidos', u_at.apellidos,
                'nombre_completo', u_at.nombres || ' ' || u_at.apellidos,
                'fecha_registro', at.fecha_registro
            )
            ORDER BY at.fecha_registro DESC
        )
        FROM atienden at
        INNER JOIN usuarios u_at ON at.id_usuario = u_at.cedula
        WHERE at.num_cita = a.num_cita AND at.id_caso = a.id_caso),
        '[]'::json
    ) AS usuarios_atendieron
FROM auditoria_actualizacion_citas a
LEFT JOIN usuarios u_actualizo ON a.id_usuario_actualizo = u_actualizo.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.num_cita::TEXT ILIKE '%' || $4 || '%'
        OR a.id_caso::TEXT ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST,
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.num_cita END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.num_cita END ASC NULLS FIRST;
