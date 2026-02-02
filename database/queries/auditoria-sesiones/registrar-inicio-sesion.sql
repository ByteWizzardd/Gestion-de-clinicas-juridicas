INSERT INTO auditoria_sesiones (
    cedula_usuario,
    ip_direccion,
    dispositivo,
    exitoso
) VALUES (
    $1,
    $2,
    $3,
    $4
) RETURNING id_sesion;
