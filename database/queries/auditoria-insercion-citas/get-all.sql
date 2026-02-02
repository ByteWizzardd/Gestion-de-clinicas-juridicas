-- Obtener todas las citas creadas con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_creo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en num_cita, id_caso, orientacion
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    to_char(a.fecha_encuentro, 'YYYY-MM-DD') as fecha_encuentro,
    to_char(a.fecha_proxima_cita, 'YYYY-MM-DD') as fecha_proxima_cita,
    a.orientacion,
    to_char(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
    -- Información de auditoría: usuario que creó la cita
    a.id_usuario_creo,
    u_creo.nombres AS nombres_usuario_creo,
    u_creo.apellidos AS apellidos_usuario_creo,
    CONCAT(u_creo.nombres, ' ', u_creo.apellidos) AS nombre_completo_usuario_creo,
    u_creo.foto_perfil AS foto_perfil_usuario_creo,
    -- Información de usuarios que atendieron la cita
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id_usuario', at.id_usuario,
                'nombres', u_at.nombres,
                'apellidos', u_at.apellidos,
                'nombre_completo', u_at.nombres || ' ' || u_at.apellidos,
                'fecha_registro', to_char(at.fecha_registro, 'YYYY-MM-DD"T"HH24:MI:SS')
            )
            ORDER BY at.fecha_registro DESC
        )
        FROM atienden at
        INNER JOIN usuarios u_at ON at.id_usuario = u_at.cedula
        WHERE at.num_cita = a.num_cita AND at.id_caso = a.id_caso),
        '[]'::json
    ) AS usuarios_atendieron
FROM auditoria_insercion_citas a
LEFT JOIN usuarios u_creo ON a.id_usuario_creo = u_creo.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.num_cita::TEXT ILIKE '%' || $4 || '%'
        OR a.id_caso::TEXT ILIKE '%' || $4 || '%'
        OR a.orientacion ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST,
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.num_cita END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.num_cita END ASC NULLS FIRST;
