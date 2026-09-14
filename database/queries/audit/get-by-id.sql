-- Sin a.*: las columnas sensibles que copia el trigger genérico (hash de la
-- contraseña, contenido del archivo) no deben salir de la BD.
SELECT
    a.id, a.id_transaccion, a.entidad, a.operacion, a.id_entidad, a.id_usuario, a.metadata, a.fecha_evento,
    a.datos_anteriores - 'contrasena' - 'documento_data' as datos_anteriores,
    (a.datos_nuevos - 'contrasena' - 'documento_data')
        || CASE WHEN a.datos_nuevos ? 'contrasena' AND a.datos_anteriores ? 'contrasena'
                THEN '{"contrasena_cambiada": true}'::jsonb ELSE '{}'::jsonb END as datos_nuevos,
    a.id_usuario as usuario_id,
    COALESCE(u.nombres || ' ' || u.apellidos, a.id_usuario) as usuario_nombre,
    a.fecha_evento as fecha
FROM auditoria_eventos a
LEFT JOIN usuarios u ON u.cedula = a.id_usuario
WHERE a.id = $1
