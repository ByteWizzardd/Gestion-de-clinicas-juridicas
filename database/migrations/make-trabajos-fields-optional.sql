-- Migración: Hacer campos condicion_actividad y condicion_trabajo opcionales en trabajos
-- Fecha: 2025-12-13
-- Descripción: Permite que condicion_actividad y condicion_trabajo sean NULL,
--              ya que la lógica del formulario es condicional

-- Paso 1: Eliminar el constraint NOT NULL de condicion_actividad
ALTER TABLE trabajos
ALTER COLUMN condicion_actividad DROP NOT NULL;

-- Paso 2: Eliminar el constraint NOT NULL de condicion_trabajo
ALTER TABLE trabajos
ALTER COLUMN condicion_trabajo DROP NOT NULL;

