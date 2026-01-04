-- Agregar campos para capturar cambios de estado y municipio en auditoría de parroquias
ALTER TABLE auditoria_actualizacion_parroquias
ADD COLUMN IF NOT EXISTS id_estado_anterior INTEGER,
ADD COLUMN IF NOT EXISTS id_estado_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS num_municipio_anterior INTEGER,
ADD COLUMN IF NOT EXISTS num_municipio_nuevo INTEGER;
