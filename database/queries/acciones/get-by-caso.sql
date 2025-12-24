-- Obtener todas las acciones realizadas para un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    a.num_accion,
    a.id_caso,
    a.detalle_accion,
    a.comentario,
    a.id_usuario_registra,
    a.fecha_registro,
    u.nombres AS nombres_usuario_registra,
    u.apellidos AS apellidos_usuario_registra,
    u.nombres || ' ' || u.apellidos AS nombre_completo_usuario_registra,
    -- Información de usuarios que ejecutaron la acción
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id_usuario', e.id_usuario_ejecuta,
                'nombres', ue.nombres,
                'apellidos', ue.apellidos,
                'nombre_completo', ue.nombres || ' ' || ue.apellidos,
                'fecha_ejecucion', e.fecha_ejecucion
            )
        )
        FROM ejecutan e
        INNER JOIN usuarios ue ON e.id_usuario_ejecuta = ue.cedula
        WHERE e.num_accion = a.num_accion AND e.id_caso = a.id_caso),
        '[]'::json
    ) AS ejecutores
FROM acciones a
INNER JOIN usuarios u ON a.id_usuario_registra = u.cedula
WHERE a.id_caso = $1
ORDER BY a.fecha_registro DESC, a.num_accion DESC;

