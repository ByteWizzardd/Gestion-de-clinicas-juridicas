-- Script de verificación: Verificar si las columnas existen en la tabla de auditoría
-- Ejecuta esto para ver qué columnas tiene actualmente la tabla

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'auditoria_actualizacion_solicitantes'
ORDER BY ordinal_position;
