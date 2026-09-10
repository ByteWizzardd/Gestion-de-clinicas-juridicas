SELECT
    ae.id::int AS id_sesion,
    ae.id_usuario AS cedula_usuario,
    to_char(ae.fecha_evento, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_inicio,
    to_char((ae.metadata->>'fecha_cierre')::timestamp, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_cierre,
    ae.metadata->>'ip' as ip_direccion,
    ae.metadata->>'dispositivo' as dispositivo,
    (ae.datos_nuevos->>'exitoso')::boolean as exitoso,
    u.nombres,
    u.apellidos,
    u.nombre_usuario,
    ae.metadata->>'detalle' as detalle
FROM auditoria_eventos ae
LEFT JOIN usuarios u ON ae.id_usuario = u.cedula
WHERE
    ae.entidad = 'sesion' AND ae.operacion = 'intento_fallido' AND
    (ae.id_usuario ILIKE '%' || $3 || '%' OR
     u.nombres ILIKE '%' || $3 || '%' OR
     u.apellidos ILIKE '%' || $3 || '%' OR
     u.nombre_usuario ILIKE '%' || $3 || '%' OR
     ae.metadata->>'ip' ILIKE '%' || $3 || '%' OR
     ae.metadata->>'dispositivo' ILIKE '%' || $3 || '%')
    AND ($5::text IS NULL OR ae.id_usuario = $5)
    AND ($6::timestamp IS NULL OR ae.fecha_evento >= $6)
    AND ($7::timestamp IS NULL OR ae.fecha_evento <= $7)
ORDER BY
    CASE WHEN $4 = 'asc' THEN ae.fecha_evento END ASC,
    CASE WHEN $4 = 'desc' OR $4 IS NULL THEN ae.fecha_evento END DESC
LIMIT $1 OFFSET $2;
