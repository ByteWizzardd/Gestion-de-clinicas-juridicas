-- Obtener las acciones más recientes de los casos asignados al usuario
-- Parámetros: $1 = cedula_usuario, $2 = limite (opcional, por defecto 10)
-- Retorna las últimas acciones de los casos donde el usuario está asignado
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
WHERE c.id_caso IN (
    -- Casos donde el usuario está asignado como estudiante
    SELECT DISTINCT id_caso 
    FROM se_le_asigna 
    WHERE cedula_estudiante = $1 AND habilitado = true
    
    UNION
    
    -- Casos donde el usuario supervisa como profesor
    SELECT DISTINCT s.id_caso
    FROM supervisa s
    INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
    WHERE p.cedula_profesor = $1 AND s.habilitado = true
)
ORDER BY a.fecha_registro DESC, a.num_accion DESC
LIMIT COALESCE($2, 10);

