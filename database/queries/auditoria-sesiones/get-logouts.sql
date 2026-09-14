-- Sesiones cerradas (logouts), leídas desde auditoria_eventos (entidad='sesion').
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
    u.nombre_usuario
FROM auditoria_eventos ae
LEFT JOIN usuarios u ON ae.id_usuario = u.cedula
WHERE ae.entidad = 'sesion' AND (ae.metadata->>'fecha_cierre') IS NOT NULL
    AND ($4::text IS NULL OR ae.id_usuario = $4)
    AND ($5::date IS NULL OR (ae.metadata->>'fecha_cierre')::timestamp >= $5::date)
    AND ($6::date IS NULL OR (ae.metadata->>'fecha_cierre')::timestamp < $6::date + 1)
ORDER BY
    CASE WHEN $3 = 'asc' THEN (ae.metadata->>'fecha_cierre')::timestamp END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN (ae.metadata->>'fecha_cierre')::timestamp END DESC
LIMIT $1 OFFSET $2;
