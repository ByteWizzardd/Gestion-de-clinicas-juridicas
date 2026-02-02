SELECT COUNT(*) as count
FROM auditoria_descarga_soportes ads
LEFT JOIN usuarios u ON ads.cedula_descargo = u.cedula
WHERE
    (
        LOWER(ads.nombre_archivo) LIKE LOWER('%' || $1 || '%') OR
        LOWER(u.nombres) LIKE LOWER('%' || $1 || '%') OR
        LOWER(u.apellidos) LIKE LOWER('%' || $1 || '%') OR
        ads.cedula_descargo LIKE '%' || $1 || '%' OR
        ads.ip_direccion LIKE '%' || $1 || '%' OR
        CAST(ads.id_caso AS TEXT) LIKE '%' || $1 || '%'
    ) AND
    ($2::text IS NULL OR ads.cedula_descargo = $2) AND
    ($3::timestamp IS NULL OR ads.fecha_descarga >= $3) AND
    ($4::timestamp IS NULL OR ads.fecha_descarga <= $4);
