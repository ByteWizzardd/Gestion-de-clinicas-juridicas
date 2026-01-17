-- Obtiene todas las acciones eliminadas registradas en la auditoría
-- Incluye ejecutores relacionados usando subquery agregada
SELECT 
    aea.id,
    aea.num_accion,
    aea.id_caso,
    aea.detalle_accion,
    aea.comentario,
    aea.id_usuario_registra,
    aea.fecha_registro,
    aea.eliminado_por,
    aea.motivo,
    aea.fecha,
    -- Info del caso (puede no existir si el caso también fue eliminado)
    c.tramite AS tramite_caso,
    n.nombre_nucleo AS nombre_nucleo,
    -- Info del solicitante
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    -- Info del usuario que registró la acción original
    ur.nombres AS nombres_usuario_registra,
    ur.apellidos AS apellidos_usuario_registra,
    CONCAT(ur.nombres, ' ', ur.apellidos) AS nombre_completo_usuario_registra,
    -- Info del usuario que eliminó
    ue.nombres AS nombres_eliminado_por,
    ue.apellidos AS apellidos_eliminado_por,
    CONCAT(ue.nombres, ' ', ue.apellidos) AS nombre_completo_eliminado_por,
    ue.foto_perfil AS foto_perfil_eliminado_por,
    -- Ejecutores (de tabla normalizada)
    (SELECT json_agg(json_build_object(
        'cedula', aeae.id_usuario_ejecutor,
        'nombre', CONCAT(aeae.nombres_ejecutor, ' ', aeae.apellidos_ejecutor),
        'fecha_ejecucion', TO_CHAR(aeae.fecha_ejecucion, 'YYYY-MM-DD')
    ))
    FROM auditoria_eliminacion_acciones_ejecutores aeae
    WHERE aeae.id_auditoria_eliminacion = aea.id) AS ejecutores
FROM auditoria_eliminacion_acciones aea
LEFT JOIN casos c ON aea.id_caso = c.id_caso
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN solicitantes s ON c.cedula = s.cedula
LEFT JOIN usuarios ur ON aea.id_usuario_registra = ur.cedula
LEFT JOIN usuarios ue ON aea.eliminado_por = ue.cedula
WHERE 
    ($1::TIMESTAMP IS NULL OR aea.fecha >= $1::TIMESTAMP) AND
    ($2::TIMESTAMP IS NULL OR aea.fecha <= $2::TIMESTAMP + INTERVAL '1 day') AND
    ($3::VARCHAR IS NULL OR aea.eliminado_por = $3) AND
    ($4::INTEGER IS NULL OR aea.id_caso = $4)
ORDER BY 
    CASE WHEN $5 = 'asc' THEN aea.fecha END ASC,
    CASE WHEN $5 = 'desc' OR $5 IS NULL THEN aea.fecha END DESC;
