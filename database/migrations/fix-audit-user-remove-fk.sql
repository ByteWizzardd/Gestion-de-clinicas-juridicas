-- Eliminar la restricción de clave foránea de ci_usuario en la tabla de auditoría de actualizaciones
-- Intentamos eliminar el nombre estándar de la restricción
ALTER TABLE auditoria_actualizacion_usuarios DROP CONSTRAINT IF EXISTS auditoria_actualizacion_usuarios_ci_usuario_fkey;

-- También nos aseguramos de que la columna NO sea NULL, ya que ahora será un dato histórico
-- (Aunque si ya era NOT NULL, esto es redundante, pero confirma el estado deseado si se quitó antes)
ALTER TABLE auditoria_actualizacion_usuarios ALTER COLUMN ci_usuario SET NOT NULL;
