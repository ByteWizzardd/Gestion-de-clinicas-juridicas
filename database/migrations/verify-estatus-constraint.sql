-- Script para verificar y corregir el CHECK constraint de estatus
-- Este script muestra el constraint actual y lo corrige si es necesario

-- Paso 1: Ver el constraint actual
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'casos'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%estatus%';

-- Paso 2: Eliminar el constraint existente
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'casos'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%estatus%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE casos DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    ELSE
        RAISE NOTICE 'No se encontró el constraint de estatus';
    END IF;
END $$;

-- Paso 3: Agregar el nuevo constraint con todos los valores correctos
ALTER TABLE casos
ADD CONSTRAINT casos_estatus_check
CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría', 'En revisión'));

-- Paso 4: Verificar que se creó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'casos'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%estatus%';

