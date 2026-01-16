SELECT
    ae.id,
    ae.num_beneficiario,
    ae.cedula,
    ae.nombres,
    ae.apellidos,
    ae.id_caso,
    ae.id_usuario_elimino,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    ae.fecha_eliminacion,
    ae.fecha_nacimiento,
    ae.sexo,
    ae.tipo_beneficiario,
    ae.parentesco
FROM auditoria_eliminacion_beneficiarios ae
LEFT JOIN usuarios u ON ae.id_usuario_elimino = u.cedula
LEFT JOIN casos c ON ae.id_caso = c.id_caso
ORDER BY ae.fecha_eliminacion DESC;
