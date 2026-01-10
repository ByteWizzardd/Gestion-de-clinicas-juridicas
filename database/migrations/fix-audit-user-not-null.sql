-- Remove NOT NULL constraint from ci_usuario in audit table to allow ON DELETE SET NULL to work
ALTER TABLE auditoria_actualizacion_usuarios ALTER COLUMN ci_usuario DROP NOT NULL;
