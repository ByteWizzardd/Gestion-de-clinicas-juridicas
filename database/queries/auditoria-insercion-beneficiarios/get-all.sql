SELECT
    ai.id,
    ai.num_beneficiario,
    ai.id_caso,
    ai.cedula,
    ai.nombres,
    ai.apellidos,
    ai.fecha_nacimiento,
    ai.sexo,
    ai.tipo_beneficiario,
    ai.parentesco,
    ai.id_usuario_registro,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    ai.fecha_registro
FROM auditoria_insercion_beneficiarios ai
LEFT JOIN usuarios u ON ai.id_usuario_registro = u.cedula
LEFT JOIN casos c ON ai.id_caso = c.id_caso
ORDER BY ai.fecha_registro DESC;
