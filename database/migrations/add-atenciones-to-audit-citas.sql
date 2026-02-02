-- Migración: Agregar columnas para auditoría de cambios en atenciones (usuarios que atienden)
-- Estas columnas guardan una lista de nombres de usuarios separados por coma

ALTER TABLE auditoria_actualizacion_citas 
ADD COLUMN IF NOT EXISTS atenciones_anterior TEXT,
ADD COLUMN IF NOT EXISTS atenciones_nuevo TEXT;

COMMENT ON COLUMN auditoria_actualizacion_citas.atenciones_anterior IS 'Lista de usuarios que atendían antes de la actualización (nombres separados por coma)';
COMMENT ON COLUMN auditoria_actualizacion_citas.atenciones_nuevo IS 'Lista de usuarios que atienden después de la actualización (nombres separados por coma)';
