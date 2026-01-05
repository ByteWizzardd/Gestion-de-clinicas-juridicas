-- Obtener el conteo total de actualizaciones de usuarios (excluyendo cambios de estatus puro)
SELECT COUNT(*) as count
FROM auditoria_actualizacion_usuarios a
WHERE NOT (
    a.habilitado_sistema_anterior IS DISTINCT FROM a.habilitado_sistema_nuevo
    AND (a.nombres_anterior IS NOT DISTINCT FROM a.nombres_nuevo)
    AND (a.apellidos_anterior IS NOT DISTINCT FROM a.apellidos_nuevo)
    AND (a.correo_electronico_anterior IS NOT DISTINCT FROM a.correo_electronico_nuevo)
    AND (a.nombre_usuario_anterior IS NOT DISTINCT FROM a.nombre_usuario_nuevo)
    AND (a.telefono_celular_anterior IS NOT DISTINCT FROM a.telefono_celular_nuevo)
    AND (a.tipo_usuario_anterior IS NOT DISTINCT FROM a.tipo_usuario_nuevo)
    AND (a.tipo_estudiante_anterior IS NOT DISTINCT FROM a.tipo_estudiante_nuevo)
    AND (a.tipo_profesor_anterior IS NOT DISTINCT FROM a.tipo_profesor_nuevo)
);
