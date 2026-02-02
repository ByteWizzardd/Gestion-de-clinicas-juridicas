-- Obtener todas las actualizaciones de citas de un caso específico
-- Parámetros: $1 = id_caso
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
    a.fecha_actualizacion
FROM auditoria_actualizacion_citas a
LEFT JOIN usuarios u_actualizo ON a.id_usuario_actualizo = u_actualizo.cedula
WHERE a.id_caso = $1
ORDER BY a.fecha_actualizacion DESC, a.num_cita DESC;
