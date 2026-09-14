-- Registra un intento de inicio de sesión (exitoso o fallido) como un evento
-- de auditoria_eventos (entidad='sesion'), en vez de una fila en la vieja
-- tabla auditoria_sesiones.
-- $1 = cedula_usuario, $2 = ip_direccion, $3 = dispositivo, $4 = exitoso, $5 = detalle
INSERT INTO auditoria_eventos (
    entidad, operacion, id_usuario, datos_nuevos, metadata, fecha_evento
) VALUES (
    'sesion',
    CASE WHEN $4::boolean = TRUE THEN 'inicio_sesion' ELSE 'intento_fallido' END,
    $1::varchar,
    jsonb_build_object('exitoso', $4::boolean),
    jsonb_strip_nulls(jsonb_build_object('ip', $2::text, 'dispositivo', $3::text, 'detalle', $5::text)),
    (NOW() AT TIME ZONE 'America/Caracas')
) RETURNING id::int AS id_sesion;
