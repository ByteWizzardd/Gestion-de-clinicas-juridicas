-- Obtener todos los soportes eliminados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_elimino (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en nombre_archivo, descripcion
SELECT 
    a.id,
    a.num_soporte,
    a.id_caso,
    a.nombre_archivo,
    a.tipo_mime,
    a.descripcion,
    a.fecha_consignacion,
    a.fecha_subida,
    a.fecha_eliminacion,
    a.tamano_bytes,
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
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.nombre_archivo ILIKE '%' || $4 || '%'
        OR a.descripcion ILIKE '%' || $4 || '%'
    )
ORDER BY a.fecha_eliminacion DESC, a.num_soporte DESC;
