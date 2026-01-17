-- Migración: Agregar campos ejecutores y fecha_ejecucion a auditoria_insercion_acciones
-- Fecha: 2026-01-17
-- Descripción: Guarda los ejecutores y fecha de ejecución directamente en la tabla de auditoría
--              para que no se pierdan cuando la acción sea eliminada

-- Agregar columnas a la tabla de auditoría de inserción
ALTER TABLE auditoria_insercion_acciones 
ADD COLUMN IF NOT EXISTS ejecutores TEXT,
ADD COLUMN IF NOT EXISTS fecha_ejecucion TEXT;
