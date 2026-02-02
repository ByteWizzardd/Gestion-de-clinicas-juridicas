SELECT COUNT(*) as count 
FROM auditoria_sesiones
WHERE
    ($1::text IS NULL OR cedula_usuario = $1) AND
    ($2::timestamp IS NULL OR fecha_inicio >= $2) AND
    ($3::timestamp IS NULL OR fecha_inicio <= $3);
