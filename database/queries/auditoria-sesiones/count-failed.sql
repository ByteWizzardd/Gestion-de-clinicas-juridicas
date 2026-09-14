SELECT COUNT(*) as count
FROM auditoria_eventos ae
WHERE ae.entidad = 'sesion' AND ae.operacion = 'intento_fallido'
    AND ($1::text IS NULL OR ae.id_usuario = $1)
    AND ($2::date IS NULL OR ae.fecha_evento >= $2::date)
    AND ($3::date IS NULL OR ae.fecha_evento < $3::date + 1);
