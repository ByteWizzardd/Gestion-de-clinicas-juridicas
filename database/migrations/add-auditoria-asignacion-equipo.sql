-- =========================================================
-- MIGRACIÓN: AUDITORÍA DE ACTUALIZACIÓN DE EQUIPO DE CASOS
-- =========================================================
-- Esta migración crea las tablas de auditoría para registrar
-- los cambios en la asignación del equipo (estudiantes y profesores) a casos

-- 1) TABLA PRINCIPAL DE AUDITORÍA DE ACTUALIZACIÓN DE EQUIPO
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_equipo (
    id SERIAL PRIMARY KEY,
    id_caso INTEGER NOT NULL,
    -- El usuario que realizó la modificación
    id_usuario_modifico VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    -- Fecha de la modificación
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- 2) TABLA DE MIEMBROS ANTERIORES (Equipo ANTES de la actualización)
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_equipo_anterior (
    id SERIAL PRIMARY KEY,
    id_auditoria_actualizacion INTEGER NOT NULL REFERENCES auditoria_actualizacion_equipo(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('estudiante', 'profesor')),
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    term VARCHAR(20)
);

-- 3) TABLA DE MIEMBROS NUEVOS (Equipo DESPUÉS de la actualización)
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_equipo_nuevo (
    id SERIAL PRIMARY KEY,
    id_auditoria_actualizacion INTEGER NOT NULL REFERENCES auditoria_actualizacion_equipo(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('estudiante', 'profesor')),
    cedula VARCHAR(20) NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    term VARCHAR(20)
);
