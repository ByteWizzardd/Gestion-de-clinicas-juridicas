SELECT COUNT(*) as count
FROM auditoria_descarga_soportes
WHERE
    ($1::text IS NULL OR cedula_descargo = $1) AND
    ($2::timestamp IS NULL OR fecha_descarga >= $2) AND
    ($3::timestamp IS NULL OR fecha_descarga <= $3);
