-- Migración: Remover cedula_coordinador de la tabla asignaciones
-- Fecha: 2025-12-12
-- Descripción: Elimina la columna cedula_coordinador de la tabla asignaciones

-- Paso 1: Eliminar la columna cedula_coordinador
ALTER TABLE asignaciones 
DROP COLUMN IF EXISTS cedula_coordinador;

