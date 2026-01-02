-- Migración: Agregar tabla de auditoría para actualizaciones de citas
-- Fecha: 2026-01-02
-- Descripción: Crea una tabla para registrar todas las actualizaciones de citas con información de auditoría

-- Crear tabla de auditoría para actualizaciones de citas
-- Guarda el historial completo de todas las actualizaciones
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_citas (
    id SERIAL PRIMARY KEY,
    num_cita INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    -- Valores anteriores (antes de la actualización)
    fecha_encuentro_anterior DATE,
    fecha_proxima_cita_anterior DATE,
    orientacion_anterior TEXT,
    -- Valores nuevos (después de la actualización)
    fecha_encuentro_nueva DATE,
    fecha_proxima_cita_nueva DATE,
    orientacion_nueva TEXT,
    -- Información de auditoría
    id_usuario_actualizo VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
