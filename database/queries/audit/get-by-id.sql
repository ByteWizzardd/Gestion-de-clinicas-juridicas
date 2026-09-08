SELECT 
    a.*, 
    a.id_usuario as usuario_id,
    COALESCE(u.nombres || ' ' || u.apellidos, a.id_usuario) as usuario_nombre,
    a.fecha_evento as fecha
FROM auditoria_eventos a
LEFT JOIN usuarios u ON u.cedula = a.id_usuario
WHERE a.id = $1
