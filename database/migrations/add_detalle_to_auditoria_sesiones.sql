-- Migración para añadir columna detalle a auditoria_sesiones
-- Esto permite registrar el motivo de fallos en el inicio de sesión

ALTER TABLE auditoria_sesiones ADD COLUMN IF NOT EXISTS detalle TEXT;
