-- Última purga ejecutada, para mostrarla en la pestaña de Mantenimiento.
-- Los eventos de entidad 'auditoria' nunca se purgan a sí mismos
-- (ver auditoria_clase).
SELECT
    to_char(a.fecha_evento, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha,
    a.id_usuario                                        AS usuario_id,
    COALESCE(u.nombres || ' ' || u.apellidos, a.id_usuario) AS usuario_nombre,
    (a.metadata->>'eventos_borrados')::int              AS eventos_borrados,
    a.metadata->'clases'                                AS clases
FROM auditoria_eventos a
LEFT JOIN usuarios u ON u.cedula = a.id_usuario
WHERE a.entidad = 'auditoria' AND a.operacion = 'purga'
ORDER BY a.id DESC
LIMIT 1;
