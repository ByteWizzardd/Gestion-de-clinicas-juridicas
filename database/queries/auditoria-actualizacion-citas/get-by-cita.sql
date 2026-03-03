-- Obtener todas las actualizaciones de una cita específica
-- Parámetros: $1 = num_cita, $2 = id_caso
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    -- Valores anteriores
    to_char(a.fecha_encuentro_anterior, 'YYYY-MM-DD') AS fecha_encuentro_anterior,
    to_char(a.fecha_proxima_cita_anterior, 'YYYY-MM-DD') AS fecha_proxima_cita_anterior,
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
    to_char(a.fecha_encuentro_nuevo, 'YYYY-MM-DD') AS fecha_encuentro_nuevo,
    to_char(a.fecha_proxima_cita_nuevo, 'YYYY-MM-DD') AS fecha_proxima_cita_nuevo,
    a.orientacion_nuevo,
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
    a.fecha_actualizacion
FROM auditoria_actualizacion_citas a
LEFT JOIN usuarios u_actualizo ON a.id_usuario_actualizo = u_actualizo.cedula
WHERE a.num_cita = $1 AND a.id_caso = $2
ORDER BY a.fecha_actualizacion DESC;
