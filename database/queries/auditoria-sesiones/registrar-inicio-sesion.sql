INSERT INTO auditoria_sesiones (
    cedula_usuario,
    ip_direccion,
    dispositivo,
    exitoso,
    fecha_inicio,
    detalle
) VALUES (
    $1,
    $2,
    $3,
    $4,
    (NOW() AT TIME ZONE 'America/Caracas'),
    $5
) RETURNING id_sesion;
