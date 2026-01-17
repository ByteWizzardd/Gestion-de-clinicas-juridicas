-- Obtiene todas las acciones creadas registradas en la auditoría
-- Incluye ejecutores relacionados usando subquery agregada
SELECT 
    aia.id,
    aia.num_accion,
    aia.id_caso,
    aia.detalle_accion,
    aia.comentario,
    aia.id_usuario_registra,
    aia.fecha_registro,
    aia.id_usuario_creo,
    aia.fecha_creacion,
    -- Info del caso
    c.tramite AS tramite_caso,
    n.nombre_nucleo AS nombre_nucleo,
    -- Info del solicitante
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    -- Info del usuario que registra la acción
    ur.nombres AS nombres_usuario_registra,
    ur.apellidos AS apellidos_usuario_registra,
    CONCAT(ur.nombres, ' ', ur.apellidos) AS nombre_completo_usuario_registra,
    -- Info del usuario que creó el registro de auditoría
    uc.nombres AS nombres_usuario_creo,
    uc.apellidos AS apellidos_usuario_creo,
    CONCAT(uc.nombres, ' ', uc.apellidos) AS nombre_completo_usuario_creo,
    uc.foto_perfil AS foto_perfil_usuario_creo,
    -- Ejecutores (de tabla normalizada, con fallback a tabla ejecutan si no hay registros)
    COALESCE(
        (SELECT json_agg(json_build_object(
            'cedula', aiae.id_usuario_ejecutor,
            'nombre', CONCAT(aiae.nombres_ejecutor, ' ', aiae.apellidos_ejecutor),
            'fecha_ejecucion', TO_CHAR(aiae.fecha_ejecucion, 'YYYY-MM-DD')
        ))
        FROM auditoria_insercion_acciones_ejecutores aiae
        WHERE aiae.id_auditoria_insercion = aia.id),
        -- Fallback: buscar en tabla ejecutan (para registros antiguos sin normalizar)
        (SELECT json_agg(json_build_object(
            'cedula', u.cedula,
            'nombre', CONCAT(u.nombres, ' ', u.apellidos),
            'fecha_ejecucion', TO_CHAR(e.fecha_ejecucion, 'YYYY-MM-DD')
        ))
        FROM ejecutan e
        JOIN usuarios u ON e.id_usuario_ejecuta = u.cedula
        WHERE e.num_accion = aia.num_accion AND e.id_caso = aia.id_caso)
    ) AS ejecutores
FROM auditoria_insercion_acciones aia
LEFT JOIN casos c ON aia.id_caso = c.id_caso
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN solicitantes s ON c.cedula = s.cedula
LEFT JOIN usuarios ur ON aia.id_usuario_registra = ur.cedula
LEFT JOIN usuarios uc ON aia.id_usuario_creo = uc.cedula
WHERE 
    ($1::TIMESTAMP IS NULL OR aia.fecha_creacion >= $1::TIMESTAMP) AND
    ($2::TIMESTAMP IS NULL OR aia.fecha_creacion <= $2::TIMESTAMP + INTERVAL '1 day') AND
    ($3::VARCHAR IS NULL OR aia.id_usuario_creo = $3) AND
    ($4::INTEGER IS NULL OR aia.id_caso = $4)
ORDER BY 
    CASE WHEN $5 = 'asc' THEN aia.fecha_creacion END ASC,
    CASE WHEN $5 = 'desc' OR $5 IS NULL THEN aia.fecha_creacion END DESC;
