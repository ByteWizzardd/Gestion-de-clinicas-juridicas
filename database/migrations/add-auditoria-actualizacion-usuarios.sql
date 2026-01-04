-- Migración: Agregar tabla de auditoría para actualizaciones de usuarios
-- Fecha: 2026-01-XX
-- Descripción: Crea una tabla para registrar todas las actualizaciones de usuarios con información de auditoría
-- Incluye cambios en tipo_usuario, tipo_estudiante y tipo_profesor

-- Crear tabla de auditoría para actualizaciones de usuarios
-- Guarda el historial completo de todas las actualizaciones
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_usuarios (
    id SERIAL PRIMARY KEY,
    ci_usuario VARCHAR(20) NOT NULL REFERENCES usuarios(cedula) ON DELETE SET NULL,
    -- Valores anteriores (antes de la actualización)
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    correo_electronico_anterior VARCHAR(100),
    nombre_usuario_anterior VARCHAR(50),
    telefono_celular_anterior VARCHAR(20),
    habilitado_sistema_anterior BOOLEAN,
    -- Valores nuevos (después de la actualización)
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    correo_electronico_nuevo VARCHAR(100),
    nombre_usuario_nuevo VARCHAR(50),
    telefono_celular_nuevo VARCHAR(20),
    habilitado_sistema_nuevo BOOLEAN,
    -- Cambio de tipo de usuario (si aplica)
    tipo_usuario_anterior VARCHAR(20),
    tipo_usuario_nuevo VARCHAR(20),
    -- Cambio de tipo de estudiante (si aplica)
    tipo_estudiante_anterior VARCHAR(50),
    tipo_estudiante_nuevo VARCHAR(50),
    -- Cambio de tipo de profesor (si aplica)
    tipo_profesor_anterior VARCHAR(20),
    tipo_profesor_nuevo VARCHAR(20),
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);
