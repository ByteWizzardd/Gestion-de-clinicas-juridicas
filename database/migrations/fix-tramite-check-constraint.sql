-- Migración: Corregir CHECK constraint de tramite
-- Fecha: 2024-12-07
-- Descripción: Actualiza el CHECK constraint del campo tramite para eliminar los paréntesis
--              del valor 'Redacción documentos y/o convenio'

-- Paso 1: Eliminar el constraint existente
-- PostgreSQL genera automáticamente nombres para constraints inline, típicamente: casos_tramite_check
-- Usamos IF EXISTS para evitar errores si el nombre es diferente
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar el nombre del constraint del campo tramite
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'casos'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%tramite%';

    -- Si encontramos el constraint, eliminarlo
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE casos DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Paso 2: Actualizar registros existentes que tengan el valor con paréntesis
UPDATE casos
SET tramite = 'Redacción documentos y/o convenio'
WHERE tramite = '(Redacción documentos y/o convenio)';

-- Paso 3: Agregar el nuevo constraint sin paréntesis
ALTER TABLE casos
ADD CONSTRAINT casos_tramite_check
CHECK (tramite IN (
    'Asesoría', 
    'Conciliación y Mediación', 
    'Redacción documentos y/o convenio',
    'Asistencia Judicial - Casos externos'
));

