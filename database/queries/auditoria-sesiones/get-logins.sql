-- Sesiones exitosas (logins), leídas desde auditoria_eventos (entidad='sesion').
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
WHERE ae.entidad = 'sesion' AND ae.operacion = 'inicio_sesion'
    AND ($4::text IS NULL OR ae.id_usuario = $4)
    AND ($5::timestamp IS NULL OR ae.fecha_evento >= $5)
    AND ($6::timestamp IS NULL OR ae.fecha_evento <= $6)
ORDER BY
    CASE WHEN $3 = 'asc' THEN ae.fecha_evento END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN ae.fecha_evento END DESC
LIMIT $1 OFFSET $2;
