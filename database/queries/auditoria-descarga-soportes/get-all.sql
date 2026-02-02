SELECT 
    ads.id,
    ads.num_soporte,
    ads.id_caso,
    ads.nombre_archivo,
    ads.cedula_descargo,
    ads.ip_direccion,
    ads.fecha_descarga,
    -- Usuario que descargó
    u.nombres AS nombres_usuario_descargo,
    u.apellidos AS apellidos_usuario_descargo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_descargo,
    u.foto_perfil AS foto_perfil_usuario_descargo
FROM auditoria_descarga_soportes ads
LEFT JOIN usuarios u ON ads.cedula_descargo = u.cedula
WHERE
    ($4::text IS NULL OR ads.cedula_descargo = $4) AND
    ($5::timestamp IS NULL OR ads.fecha_descarga >= $5) AND
    ($6::timestamp IS NULL OR ads.fecha_descarga <= $6)
ORDER BY 
    CASE WHEN $3 = 'asc' THEN ads.fecha_descarga END ASC,
    CASE WHEN $3 = 'desc' OR $3 IS NULL THEN ads.fecha_descarga END DESC
LIMIT $1 OFFSET $2;
