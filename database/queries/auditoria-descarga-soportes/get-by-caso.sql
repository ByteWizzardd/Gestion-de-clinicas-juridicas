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
WHERE ads.id_caso = $1
ORDER BY ads.fecha_descarga DESC;
