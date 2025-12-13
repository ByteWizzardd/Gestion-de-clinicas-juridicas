-- Migración: Hacer el campo observaciones opcional en la tabla casos
-- Fecha: 2025-12-12
-- Descripción: Cambia el campo observaciones de NOT NULL a NULL permitido

-- Paso 1: Alterar la columna para permitir valores NULL
ALTER TABLE casos 
ALTER COLUMN observaciones DROP NOT NULL;

