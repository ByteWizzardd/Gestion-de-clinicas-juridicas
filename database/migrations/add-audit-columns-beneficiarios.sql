-- Migración: Agregar campos para auditoría de creación y actualización en beneficiarios
-- Descripción: Agrega campos id_usuario_registro y id_usuario_actualizo

ALTER TABLE beneficiarios
ADD COLUMN IF NOT EXISTS id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula),
ADD COLUMN IF NOT EXISTS id_usuario_actualizo VARCHAR(20) REFERENCES usuarios(cedula);

CREATE INDEX IF NOT EXISTS idx_beneficiarios_usuario_registro ON beneficiarios(id_usuario_registro);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_usuario_actualizo ON beneficiarios(id_usuario_actualizo);
