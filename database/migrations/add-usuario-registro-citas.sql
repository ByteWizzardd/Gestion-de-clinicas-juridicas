-- Migración: Agregar campo para registrar quién creó/registró la cita
-- Fecha: 2026-01-02
-- Descripción: Agrega campo id_usuario_registro para auditoría de creación de citas

-- Agregar campo para registrar quién registró la cita
ALTER TABLE citas
ADD COLUMN IF NOT EXISTS id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula);

-- Crear índice para búsquedas por usuario que registró
CREATE INDEX IF NOT EXISTS idx_citas_usuario_registro ON citas(id_usuario_registro);
