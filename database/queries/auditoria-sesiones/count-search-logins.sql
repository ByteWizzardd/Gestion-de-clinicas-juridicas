SELECT COUNT(*) as count
FROM auditoria_eventos ae
LEFT JOIN usuarios u ON ae.id_usuario = u.cedula
WHERE
    ae.entidad = 'sesion' AND ae.operacion = 'inicio_sesion' AND
    (ae.id_usuario ILIKE '%' || $1 || '%' OR
     u.nombres ILIKE '%' || $1 || '%' OR
     u.apellidos ILIKE '%' || $1 || '%' OR
     u.nombre_usuario ILIKE '%' || $1 || '%' OR
     ae.metadata->>'ip' ILIKE '%' || $1 || '%' OR
     ae.metadata->>'dispositivo' ILIKE '%' || $1 || '%')
    AND ($2::text IS NULL OR ae.id_usuario = $2)
    AND ($3::timestamp IS NULL OR ae.fecha_evento >= $3)
    AND ($4::timestamp IS NULL OR ae.fecha_evento <= $4);
