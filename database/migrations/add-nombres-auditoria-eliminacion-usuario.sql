-- Agregar campos de nombre y apellido a la tabla de auditoría de eliminación de usuarios
ALTER TABLE auditoria_eliminacion_usuario 
ADD COLUMN IF NOT EXISTS nombres_usuario_eliminado VARCHAR(100),
ADD COLUMN IF NOT EXISTS apellidos_usuario_eliminado VARCHAR(100);

-- Actualizar la zona horaria de la fecha si es necesario
ALTER TABLE auditoria_eliminacion_usuario 
ALTER COLUMN fecha SET DEFAULT (NOW() AT TIME ZONE 'America/Caracas');
