-- Obtener todos los soportes eliminados de un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    a.id,
    a.num_soporte,
    a.id_caso,
    a.nombre_archivo,
    a.tipo_mime,
    a.descripcion,
    a.fecha_consignacion,
    a.fecha_eliminacion,

    -- Información de auditoría: usuario que subió
    a.id_usuario_subio,
    u_subio.nombres AS nombres_usuario_subio,
    u_subio.apellidos AS apellidos_usuario_subio,
    CONCAT(u_subio.nombres, ' ', u_subio.apellidos) AS nombre_completo_usuario_subio,
    -- Información de auditoría: usuario que eliminó
    a.id_usuario_elimino,
    u_elimino.nombres AS nombres_usuario_elimino,
    u_elimino.apellidos AS apellidos_usuario_elimino,
    CONCAT(u_elimino.nombres, ' ', u_elimino.apellidos) AS nombre_completo_usuario_elimino,
    -- Motivo de la eliminación
    a.motivo
FROM auditoria_eliminacion_soportes a
LEFT JOIN usuarios u_subio ON a.id_usuario_subio = u_subio.cedula
LEFT JOIN usuarios u_elimino ON a.id_usuario_elimino = u_elimino.cedula
WHERE a.id_caso = $1
ORDER BY a.fecha_eliminacion DESC, a.num_soporte DESC;
