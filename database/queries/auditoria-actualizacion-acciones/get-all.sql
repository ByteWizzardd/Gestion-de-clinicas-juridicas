-- Obtiene todas las acciones actualizadas registradas en la auditoría
-- Incluye ejecutores anteriores y nuevos usando subqueries a tabla normalizada
SELECT 
    aaa.id,
    aaa.num_accion,
    aaa.id_caso,
    -- Valores anteriores
    aaa.detalle_accion_anterior,
    aaa.comentario_anterior,
    aaa.id_usuario_registra_anterior,
    aaa.fecha_registro_anterior,
    -- Valores nuevos
    aaa.detalle_accion_nuevo,
    aaa.comentario_nuevo,
    aaa.id_usuario_registra_nuevo,
    aaa.fecha_registro_nuevo,
    -- Auditoría
    aaa.id_usuario_actualizo,
    aaa.fecha_actualizacion,
    -- Ejecutores anteriores (de tabla normalizada)
    (SELECT json_agg(json_build_object(
        'cedula', aaae.id_usuario_ejecutor,
        'nombre', CONCAT(aaae.nombres_ejecutor, ' ', aaae.apellidos_ejecutor),
        'fecha_ejecucion', TO_CHAR(aaae.fecha_ejecucion, 'YYYY-MM-DD')
    ))
    FROM auditoria_actualizacion_acciones_ejecutores aaae
    WHERE aaae.id_auditoria_actualizacion = aaa.id AND aaae.tipo = 'anterior') AS ejecutores_anterior,
    -- Ejecutores nuevos (de tabla normalizada)
    (SELECT json_agg(json_build_object(
        'cedula', aaae.id_usuario_ejecutor,
        'nombre', CONCAT(aaae.nombres_ejecutor, ' ', aaae.apellidos_ejecutor),
        'fecha_ejecucion', TO_CHAR(aaae.fecha_ejecucion, 'YYYY-MM-DD')
    ))
    FROM auditoria_actualizacion_acciones_ejecutores aaae
    WHERE aaae.id_auditoria_actualizacion = aaa.id AND aaae.tipo = 'nuevo') AS ejecutores_nuevo,
    -- Info del caso
    c.tramite AS tramite_caso,
    n.nombre_nucleo AS nombre_nucleo,
    -- Info del solicitante
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    -- Info del usuario que actualizó
    ua.nombres AS nombres_usuario_actualizo,
    ua.apellidos AS apellidos_usuario_actualizo,
    CONCAT(ua.nombres, ' ', ua.apellidos) AS nombre_completo_usuario_actualizo,
    ua.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_acciones aaa
LEFT JOIN casos c ON aaa.id_caso = c.id_caso
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN solicitantes s ON c.cedula = s.cedula
LEFT JOIN usuarios ua ON aaa.id_usuario_actualizo = ua.cedula
WHERE 
    ($1::TIMESTAMP IS NULL OR aaa.fecha_actualizacion >= $1::TIMESTAMP) AND
    ($2::TIMESTAMP IS NULL OR aaa.fecha_actualizacion <= $2::TIMESTAMP + INTERVAL '1 day') AND
    ($3::VARCHAR IS NULL OR aaa.id_usuario_actualizo = $3) AND
    ($4::INTEGER IS NULL OR aaa.id_caso = $4) AND
    ($5::VARCHAR IS NULL OR 
        unaccent(aaa.detalle_accion_nuevo) ILIKE '%' || unaccent($5) || '%' OR 
        unaccent(aaa.comentario_nuevo) ILIKE '%' || unaccent($5) || '%' OR
        unaccent(aaa.detalle_accion_anterior) ILIKE '%' || unaccent($5) || '%' OR 
        unaccent(aaa.comentario_anterior) ILIKE '%' || unaccent($5) || '%' OR
        aaa.num_accion::TEXT ILIKE '%' || $5 || '%' OR
        aaa.id_caso::TEXT ILIKE '%' || $5 || '%')
ORDER BY 
    CASE WHEN $6 = 'asc' THEN aaa.fecha_actualizacion END ASC,
    CASE WHEN $6 = 'desc' OR $6 IS NULL THEN aaa.fecha_actualizacion END DESC;
