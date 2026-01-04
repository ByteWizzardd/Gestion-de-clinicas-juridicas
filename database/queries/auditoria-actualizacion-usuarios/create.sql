-- Crear registro de auditoría para creación de usuario
-- Parámetros:
-- $1 = ci_usuario
-- $2 = nombres_nuevo
-- $3 = apellidos_nuevo
-- $4 = correo_electronico_nuevo
-- $5 = nombre_usuario_nuevo
-- $6 = telefono_celular_nuevo
-- $7 = tipo_usuario_nuevo
-- $8 = tipo_estudiante_nuevo (puede ser NULL)
-- $9 = tipo_profesor_nuevo (puede ser NULL)
-- $10 = id_usuario_actualizo

INSERT INTO auditoria_actualizacion_usuarios (
    ci_usuario,
    nombres_anterior,
    nombres_nuevo,
    apellidos_anterior,
    apellidos_nuevo,
    correo_electronico_anterior,
    correo_electronico_nuevo,
    nombre_usuario_anterior,
    nombre_usuario_nuevo,
    telefono_celular_anterior,
    telefono_celular_nuevo,
    habilitado_sistema_anterior,
    habilitado_sistema_nuevo,
    tipo_usuario_anterior,
    tipo_usuario_nuevo,
    tipo_estudiante_anterior,
    tipo_estudiante_nuevo,
    tipo_profesor_anterior,
    tipo_profesor_nuevo,
    id_usuario_actualizo,
    fecha_actualizacion
) VALUES (
    $1,
    NULL, -- nombres_anterior (no existe antes)
    $2,
    NULL, -- apellidos_anterior
    $3,
    NULL, -- correo_electronico_anterior
    $4,
    NULL, -- nombre_usuario_anterior
    $5,
    NULL, -- telefono_celular_anterior
    $6,
    NULL, -- habilitado_sistema_anterior
    TRUE, -- habilitado_sistema_nuevo
    NULL, -- tipo_usuario_anterior
    $7,
    NULL, -- tipo_estudiante_anterior
    $8,
    NULL, -- tipo_profesor_anterior
    $9,
    $10,
    (NOW() AT TIME ZONE 'America/Caracas')
)
RETURNING *;
