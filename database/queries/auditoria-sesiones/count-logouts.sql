SELECT COUNT(*) as count
FROM auditoria_eventos ae
WHERE ae.entidad = 'sesion' AND (ae.metadata->>'fecha_cierre') IS NOT NULL
    AND ($1::text IS NULL OR ae.id_usuario = $1)
    AND ($2::date IS NULL OR (ae.metadata->>'fecha_cierre')::timestamp >= $2::date)
    AND ($3::date IS NULL OR (ae.metadata->>'fecha_cierre')::timestamp < $3::date + 1);
