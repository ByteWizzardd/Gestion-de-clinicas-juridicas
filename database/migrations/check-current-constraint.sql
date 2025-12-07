-- Script para verificar el constraint actual de estatus
-- Ejecuta esto primero para ver qué constraint tienes actualmente

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'casos'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%estatus%';

