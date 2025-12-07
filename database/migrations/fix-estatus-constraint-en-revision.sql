-- Migración: Corregir CHECK constraint de estatus para incluir 'En revisión'
-- Fecha: 2024-12-07
-- Descripción: Asegura que el CHECK constraint incluya 'En revisión' correctamente

-- Paso 1: Eliminar el constraint existente
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar el nombre del constraint del campo estatus
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'casos'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%estatus%';
    
    -- Si encontramos el constraint, eliminarlo
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE casos DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    ELSE
        RAISE NOTICE 'No se encontró el constraint de estatus';
    END IF;
END $$;

-- Paso 2: Agregar el nuevo constraint con 'En revisión' incluido
-- IMPORTANTE: Usar exactamente 'En revisión' con la ó con tilde
ALTER TABLE casos
ADD CONSTRAINT casos_estatus_check
CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría', 'En revisión'));

-- Paso 3: Verificar que se creó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'casos'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%estatus%';

