SELECT COUNT(*) as count
FROM auditoria_eventos ae
WHERE ae.entidad = 'sesion' AND ae.operacion = 'inicio_sesion'
    AND ($1::text IS NULL OR ae.id_usuario = $1)
    AND ($2::timestamp IS NULL OR ae.fecha_evento >= $2)
    AND ($3::timestamp IS NULL OR ae.fecha_evento <= $3);
