-- Script para agregar restricción de formato al campo term de la tabla semestres
-- Asegura que solo se puedan insertar valores con formato "YYYY-XX" (ej: 2026-15)

BEGIN;

-- Primero, aseguramos que los datos existentes cumplan con el formato
-- Si ya ejecutaste update_semesters.sql, esto debería pasar sin problemas.
-- Si hay datos inválidos, este ALTER TABLE fallará.

ALTER TABLE semestres
ADD CONSTRAINT semestres_term_check 
CHECK (term ~ '^\d{4}-(15|25)$');

COMMIT;
