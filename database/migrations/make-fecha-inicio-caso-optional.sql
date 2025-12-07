-- Migración: Hacer fecha_inicio_caso opcional
-- Fecha: 2024-12-07
-- Descripción: Actualiza la columna fecha_inicio_caso para que sea opcional
--              pero mantenga CURRENT_DATE como valor por defecto

-- Modificar fecha_inicio_caso para que sea opcional
ALTER TABLE casos
ALTER COLUMN fecha_inicio_caso DROP NOT NULL;

-- Nota: El DEFAULT CURRENT_DATE ya está establecido en el schema original,
--       así que no necesitamos agregarlo nuevamente

