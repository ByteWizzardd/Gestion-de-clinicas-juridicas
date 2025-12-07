-- Migración: Agregar 'En revisión' al dominio de estatus de casos
-- Fecha: 2024-12-07
-- Descripción: Actualiza el CHECK constraint del campo estatus para incluir 'En revisión'

-- Paso 1: Eliminar el constraint existente
-- PostgreSQL genera automáticamente nombres para constraints inline, típicamente: casos_estatus_check
-- Usamos IF EXISTS para evitar errores si el nombre es diferente
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
    END IF;
END $$;

-- Paso 2: Agregar el nuevo constraint con 'En revisión' incluido
ALTER TABLE casos 
ADD CONSTRAINT casos_estatus_check 
CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría', 'En revisión'));

