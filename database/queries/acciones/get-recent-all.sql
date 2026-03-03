-- Obtener todas las acciones más recientes de todos los casos
-- Parámetros: $1 = limite (opcional, por defecto 10)
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
    c.id_caso AS caso_id,
    COALESCE(s.nombres || ' ' || s.apellidos, 'Sin solicitante') AS nombre_solicitante,
    n.nombre_nucleo,
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
INNER JOIN casos c ON a.id_caso = c.id_caso
INNER JOIN solicitantes s ON c.cedula = s.cedula
INNER JOIN nucleos n ON c.id_nucleo = n.id_nucleo
ORDER BY a.fecha_registro DESC, a.num_accion DESC
LIMIT COALESCE($1, 10);
