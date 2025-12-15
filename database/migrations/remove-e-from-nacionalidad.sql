-- Migración para eliminar 'E' de los valores permitidos de nacionalidad
-- Actualiza todos los registros existentes con nacionalidad 'E' a 'Ext'
-- Luego modifica el constraint para solo permitir 'V' y 'Ext'

BEGIN;

-- 1. Actualizar todos los registros existentes con nacionalidad 'E' a 'Ext'
UPDATE clientes
SET nacionalidad = 'Ext'
WHERE nacionalidad = 'E';

-- 2. Eliminar el constraint existente
ALTER TABLE clientes
DROP CONSTRAINT IF EXISTS clientes_nacionalidad_check;

-- 3. Agregar el nuevo constraint sin 'E'
ALTER TABLE clientes
ADD CONSTRAINT clientes_nacionalidad_check 
CHECK (nacionalidad IN ('V', 'Ext'));

COMMIT;

