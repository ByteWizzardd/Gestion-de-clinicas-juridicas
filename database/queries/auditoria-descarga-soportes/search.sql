SELECT 
    ads.id,
    ads.num_soporte,
    ads.id_caso,
    ads.nombre_archivo,
    ads.cedula_descargo,
    ads.ip_direccion,
    to_char(ads.fecha_descarga, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_descarga,
    -- Usuario que descargó
    u.nombres AS nombres_usuario_descargo,
    u.apellidos AS apellidos_usuario_descargo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_descargo,
    u.foto_perfil AS foto_perfil_usuario_descargo
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
    ($5::text IS NULL OR ads.cedula_descargo = $5) AND
    ($6::timestamp IS NULL OR ads.fecha_descarga >= $6) AND
    ($7::timestamp IS NULL OR ads.fecha_descarga <= $7)
ORDER BY 
    CASE WHEN $4 = 'asc' THEN ads.fecha_descarga END ASC,
    CASE WHEN $4 = 'desc' OR $4 IS NULL THEN ads.fecha_descarga END DESC
LIMIT $2 OFFSET $3;
