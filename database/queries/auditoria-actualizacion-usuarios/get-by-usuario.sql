-- Obtener todas las actualizaciones de un usuario específico
-- IMPORTANTE: Los datos vienen de la tabla de auditoría, NO de usuarios
-- Parámetros: $1 = ci_usuario
SELECT 
    a.id,
    a.ci_usuario,
    -- Información del usuario actualizado (desde la tabla de auditoría)
    a.nombres_nuevo AS nombres_usuario,
    a.apellidos_nuevo AS apellidos_usuario,
    CASE 
        WHEN a.nombres_nuevo IS NOT NULL AND a.apellidos_nuevo IS NOT NULL 
        THEN a.nombres_nuevo || ' ' || a.apellidos_nuevo
        WHEN a.nombres_nuevo IS NOT NULL 
        THEN a.nombres_nuevo
        WHEN a.apellidos_nuevo IS NOT NULL 
        THEN a.apellidos_nuevo
        ELSE NULL
    END AS nombre_completo_usuario,
    u.foto_perfil AS foto_perfil_usuario,
    -- Valores anteriores
    a.nombres_anterior,
    a.apellidos_anterior,
    a.correo_electronico_anterior,
    a.nombre_usuario_anterior,
    a.telefono_celular_anterior,
    a.habilitado_sistema_anterior,
    a.tipo_usuario_anterior,
    a.tipo_estudiante_anterior,
    a.tipo_profesor_anterior,
    -- Valores nuevos
    a.nombres_nuevo,
    a.apellidos_nuevo,
    a.correo_electronico_nuevo,
    a.nombre_usuario_nuevo,
    a.telefono_celular_nuevo,
    a.habilitado_sistema_nuevo,
    a.tipo_usuario_nuevo,
    a.tipo_estudiante_nuevo,
    a.tipo_profesor_nuevo,
    -- Información de auditoría
    a.id_usuario_actualizo,
    u_actualizo.nombres AS nombres_usuario_actualizo,
    u_actualizo.apellidos AS apellidos_usuario_actualizo,
    CASE 
        WHEN u_actualizo.nombres IS NOT NULL AND u_actualizo.apellidos IS NOT NULL 
        THEN u_actualizo.nombres || ' ' || u_actualizo.apellidos
        WHEN u_actualizo.nombres IS NOT NULL 
        THEN u_actualizo.nombres
        WHEN u_actualizo.apellidos IS NOT NULL 
        THEN u_actualizo.apellidos
        ELSE NULL
    END AS nombre_completo_usuario_actualizo,
    u_actualizo.foto_perfil AS foto_perfil_usuario_actualizo,
    a.fecha_actualizacion
FROM auditoria_actualizacion_usuarios a
LEFT JOIN usuarios u ON TRIM(a.ci_usuario) = TRIM(u.cedula)
LEFT JOIN usuarios u_actualizo ON TRIM(a.id_usuario_actualizo) = TRIM(u_actualizo.cedula)
WHERE a.ci_usuario = $1
ORDER BY a.fecha_actualizacion DESC;
