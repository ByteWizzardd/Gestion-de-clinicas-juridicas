-- Query para obtener todos los registros de auditoría de actualización de equipo
SELECT 
    ae.id,
    ae.id_caso,
    ae.id_usuario_modifico,
    ae.fecha_actualizacion AS fecha,
    -- Usuario que modificó
    u.nombres AS nombres_usuario_modifico,
    u.apellidos AS apellidos_usuario_modifico,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_modifico,
    -- Info del caso
    c.tramite AS tramite_caso,
    n.nombre_nucleo,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    -- Miembros anteriores (agregados como JSON array)
    (
        SELECT COALESCE(json_agg(json_build_object(
            'tipo', ant.tipo,
            'cedula', ant.cedula,
            'nombres', ant.nombres,
            'apellidos', ant.apellidos,
            'nombre_completo', CONCAT(ant.nombres, ' ', ant.apellidos),
            'term', ant.term
        )), '[]'::json)
        FROM auditoria_actualizacion_equipo_anterior ant
        WHERE ant.id_auditoria_actualizacion = ae.id
    ) AS miembros_anteriores,
    -- Miembros nuevos (agregados como JSON array)
    (
        SELECT COALESCE(json_agg(json_build_object(
            'tipo', nue.tipo,
            'cedula', nue.cedula,
            'nombres', nue.nombres,
            'apellidos', nue.apellidos,
            'nombre_completo', CONCAT(nue.nombres, ' ', nue.apellidos),
            'term', nue.term
        )), '[]'::json)
        FROM auditoria_actualizacion_equipo_nuevo nue
        WHERE nue.id_auditoria_actualizacion = ae.id
    ) AS miembros_nuevos
FROM auditoria_actualizacion_equipo ae
LEFT JOIN usuarios u ON ae.id_usuario_modifico = u.cedula
LEFT JOIN casos c ON ae.id_caso = c.id_caso
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN solicitantes s ON c.cedula = s.cedula
ORDER BY ae.fecha_actualizacion DESC;
