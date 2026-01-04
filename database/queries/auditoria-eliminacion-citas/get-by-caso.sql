-- Obtener todas las citas eliminadas de un caso específico
-- Parámetros: $1 = id_caso
-- La información adicional del caso se obtiene mediante JOINs si es necesario
SELECT 
    a.id,
    a.num_cita,
    a.id_caso,
    a.fecha_encuentro,
    a.fecha_proxima_cita,
    a.orientacion,
    a.fecha_eliminacion,
    -- Información de auditoría: usuario que registró la cita
    a.id_usuario_registro,
    u_registro.nombres AS nombres_usuario_registro,
    u_registro.apellidos AS apellidos_usuario_registro,
    CONCAT(u_registro.nombres, ' ', u_registro.apellidos) AS nombre_completo_usuario_registro,
    -- Información de auditoría: usuario que eliminó
    a.id_usuario_elimino,
    u_elimino.nombres AS nombres_usuario_elimino,
    u_elimino.apellidos AS apellidos_usuario_elimino,
    CONCAT(u_elimino.nombres, ' ', u_elimino.apellidos) AS nombre_completo_usuario_elimino,
    -- Motivo de la eliminación
    a.motivo
FROM auditoria_eliminacion_citas a
LEFT JOIN usuarios u_registro ON a.id_usuario_registro = u_registro.cedula
LEFT JOIN usuarios u_elimino ON a.id_usuario_elimino = u_elimino.cedula
WHERE a.id_caso = $1
ORDER BY a.fecha_eliminacion DESC, a.num_cita DESC;
