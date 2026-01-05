-- Migración: Agregar tabla de auditoría para actualizaciones de solicitantes
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las actualizaciones de solicitantes con información de auditoría

-- Crear tabla de auditoría para actualizaciones de solicitantes
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_solicitantes (
    id SERIAL PRIMARY KEY,
    cedula_solicitante VARCHAR(20) REFERENCES solicitantes(cedula) ON DELETE SET NULL,
    -- Valores anteriores (antes de la actualización)
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    fecha_nacimiento_anterior DATE,
    telefono_local_anterior VARCHAR(20),
    telefono_celular_anterior VARCHAR(20),
    correo_electronico_anterior VARCHAR(100),
    sexo_anterior VARCHAR(20),
    nacionalidad_anterior VARCHAR(20),
    estado_civil_anterior VARCHAR(20),
    concubinato_anterior BOOLEAN,
    tipo_tiempo_estudio_anterior VARCHAR(20),
    tiempo_estudio_anterior INTEGER,
    id_nivel_educativo_anterior INTEGER,
    id_trabajo_anterior INTEGER,
    id_actividad_anterior INTEGER,
    id_estado_anterior INTEGER,
    num_municipio_anterior INTEGER,
    num_parroquia_anterior INTEGER,
    -- Valores nuevos (después de la actualización)
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    fecha_nacimiento_nuevo DATE,
    telefono_local_nuevo VARCHAR(20),
    telefono_celular_nuevo VARCHAR(20),
    correo_electronico_nuevo VARCHAR(100),
    sexo_nuevo VARCHAR(20),
    nacionalidad_nuevo VARCHAR(20),
    estado_civil_nuevo VARCHAR(20),
    concubinato_nuevo BOOLEAN,
    tipo_tiempo_estudio_nuevo VARCHAR(20),
    tiempo_estudio_nuevo INTEGER,
    id_nivel_educativo_nuevo INTEGER,
    id_trabajo_nuevo INTEGER,
    id_actividad_nuevo INTEGER,
    id_estado_nuevo INTEGER,
    num_municipio_nuevo INTEGER,
    num_parroquia_nuevo INTEGER,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_solicitantes_cedula ON auditoria_actualizacion_solicitantes(cedula_solicitante);
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_solicitantes_usuario ON auditoria_actualizacion_solicitantes(id_usuario_actualizo);
CREATE INDEX IF NOT EXISTS idx_auditoria_actualizacion_solicitantes_fecha ON auditoria_actualizacion_solicitantes(fecha_actualizacion);
