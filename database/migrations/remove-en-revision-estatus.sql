-- Migración: Remover 'En revisión' del dominio de estatus de casos
-- Fecha: 2025-12-12
-- Descripción: Elimina 'En revisión' del CHECK constraint del campo estatus

-- Paso 1: Actualizar todos los casos con estatus 'En revisión' a 'En proceso'
UPDATE casos 
SET estatus = 'En proceso' 
WHERE estatus = 'En revisión';

-- Paso 2: Actualizar también en la tabla cambios_estatus
UPDATE cambios_estatus 
SET estatus_nuevo = 'En proceso' 
WHERE estatus_nuevo = 'En revisión';

-- Paso 3: Eliminar el constraint existente
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

-- Paso 4: Agregar el nuevo constraint sin 'En revisión'
ALTER TABLE casos 
ADD CONSTRAINT casos_estatus_check 
CHECK (estatus IN ('En proceso', 'Archivado', 'Entregado', 'Asesoría'));

