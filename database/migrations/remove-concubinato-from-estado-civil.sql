-- Migración: Eliminar 'Concubinato' del dominio de estado_civil
-- Descripción: Actualiza el CHECK constraint de estado_civil para solo permitir:
--              Soltero, Casado, Divorciado, Viudo
--              Nota: El concubinato es un campo booleano separado (concubinato BOOLEAN)

BEGIN;

-- 1. Actualizar todos los registros existentes con estado_civil = 'Concubinato'
--    a 'Soltero' como valor por defecto (puedes cambiar esto según tu lógica de negocio)
UPDATE solicitantes
SET estado_civil = 'Soltero'
WHERE estado_civil = 'Concubinato';

-- 2. Eliminar el constraint existente (si existe)
ALTER TABLE solicitantes
DROP CONSTRAINT IF EXISTS solicitantes_estado_civil_check;

-- 3. Agregar el nuevo constraint sin 'Concubinato'
ALTER TABLE solicitantes
ADD CONSTRAINT solicitantes_estado_civil_check 
CHECK (estado_civil IN ('Soltero', 'Casado', 'Divorciado', 'Viudo'));

COMMIT;

