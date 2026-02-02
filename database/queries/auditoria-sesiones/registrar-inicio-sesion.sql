INSERT INTO auditoria_sesiones (
    cedula_usuario,
    ip_direccion,
    dispositivo,
    exitoso,
    fecha_inicio
) VALUES (
    $1,
    $2,
    $3,
    $4,
    (NOW() AT TIME ZONE 'America/Caracas')
) RETURNING id_sesion;
