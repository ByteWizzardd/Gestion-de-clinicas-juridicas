-- Insertar registro de auditoría para actualización de citas (incluyendo cambios en atenciones)
-- Parámetros:
-- $1 = num_cita (INTEGER)
-- $2 = id_caso (INTEGER)
-- $3 = fecha_encuentro_anterior (DATE)
-- $4 = fecha_proxima_cita_anterior (DATE)
-- $5 = orientacion_anterior (TEXT)
-- $6 = fecha_encuentro_nueva (DATE)
-- $7 = fecha_proxima_cita_nueva (DATE)
-- $8 = orientacion_nueva (TEXT)
-- $9 = atenciones_anterior (TEXT)
-- $10 = atenciones_nuevo (TEXT)
-- $11 = id_usuario_actualizo (VARCHAR)
INSERT INTO auditoria_actualizacion_citas (
    num_cita, 
    id_caso,
    fecha_encuentro_anterior, 
    fecha_proxima_cita_anterior, 
    orientacion_anterior,
    fecha_encuentro_nueva, 
    fecha_proxima_cita_nueva, 
    orientacion_nueva,
    atenciones_anterior, 
    atenciones_nuevo,
    id_usuario_actualizo, 
    fecha_actualizacion
) VALUES (
    $1, $2,
    $3, $4, $5,
    $6, $7, $8,
    $9, $10,
    $11, (NOW() AT TIME ZONE 'America/Caracas')
);
