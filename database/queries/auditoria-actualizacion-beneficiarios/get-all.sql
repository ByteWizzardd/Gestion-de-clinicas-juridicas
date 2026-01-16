SELECT
    aa.id,
    aa.num_beneficiario,
    aa.id_caso,
    
    aa.cedula_anterior, aa.nombres_anterior, aa.apellidos_anterior, 
    aa.fecha_nacimiento_anterior, aa.sexo_anterior, aa.tipo_beneficiario_anterior, aa.parentesco_anterior,
    
    aa.cedula_nuevo, aa.nombres_nuevo, aa.apellidos_nuevo, 
    aa.fecha_nacimiento_nuevo, aa.sexo_nuevo, aa.tipo_beneficiario_nuevo, aa.parentesco_nuevo,
    
    aa.id_usuario_actualizo,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    aa.fecha_actualizacion
FROM auditoria_actualizacion_beneficiarios aa
LEFT JOIN usuarios u ON aa.id_usuario_actualizo = u.cedula
LEFT JOIN casos c ON aa.id_caso = c.id_caso
ORDER BY aa.fecha_actualizacion DESC;
