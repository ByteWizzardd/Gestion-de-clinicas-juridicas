-- Migración: Agregar campos tipo_tiempo_estudio y modificar tiempo_estudio
-- Descripción: Agrega campo tipo_tiempo_estudio para especificar el tipo de tiempo (Años, Semestres, Trimestres)
--              y modifica tiempo_estudio de VARCHAR a INTEGER con validación > 0
--              Tanto para solicitantes como para jefes de hogar

BEGIN;

-- ==========================================================
-- 1. ELIMINAR VISTAS QUE DEPENDEN DE tiempo_estudio
-- ==========================================================

-- Eliminar la vista que depende de tiempo_estudio
DROP VIEW IF EXISTS view_solicitantes_completo CASCADE;

-- ==========================================================
-- 2. SOLICITANTES
-- ==========================================================

-- Agregar campo para tipo de tiempo de estudio
ALTER TABLE solicitantes
ADD COLUMN IF NOT EXISTS tipo_tiempo_estudio VARCHAR(20) CHECK (tipo_tiempo_estudio IN ('Años', 'Semestres', 'Trimestres'));

-- Modificar tiempo_estudio de VARCHAR a INTEGER
-- Primero, eliminar el constraint NOT NULL si existe
ALTER TABLE solicitantes
ALTER COLUMN tiempo_estudio DROP NOT NULL;

-- Convertir los valores existentes (si hay datos)
-- Nota: Esto asume que los valores en tiempo_estudio son numéricos o NULL
-- Si hay valores no numéricos, se convertirán a NULL
UPDATE solicitantes
SET tiempo_estudio = NULL
WHERE tiempo_estudio IS NOT NULL 
  AND tiempo_estudio !~ '^[0-9]+$';

-- Cambiar el tipo de columna a INTEGER
ALTER TABLE solicitantes
ALTER COLUMN tiempo_estudio TYPE INTEGER USING 
  CASE 
    WHEN tiempo_estudio ~ '^[0-9]+$' THEN tiempo_estudio::INTEGER
    ELSE NULL
  END;

-- Agregar constraint de validación >= 0
ALTER TABLE solicitantes
ADD CONSTRAINT solicitantes_tiempo_estudio_check 
CHECK (tiempo_estudio IS NULL OR tiempo_estudio >= 0);

-- ==========================================================
-- 2. FAMILIAS Y HOGARES
-- ==========================================================

-- Agregar campo para tipo de tiempo de estudio del jefe
ALTER TABLE familias_y_hogares
ADD COLUMN IF NOT EXISTS tipo_tiempo_estudio_jefe VARCHAR(20) CHECK (tipo_tiempo_estudio_jefe IN ('Años', 'Semestres', 'Trimestres'));

-- Modificar tiempo_estudio_jefe de VARCHAR a INTEGER
-- Convertir los valores existentes (si hay datos)
UPDATE familias_y_hogares
SET tiempo_estudio_jefe = NULL
WHERE tiempo_estudio_jefe IS NOT NULL 
  AND tiempo_estudio_jefe !~ '^[0-9]+$';

-- Cambiar el tipo de columna a INTEGER
ALTER TABLE familias_y_hogares
ALTER COLUMN tiempo_estudio_jefe TYPE INTEGER USING 
  CASE 
    WHEN tiempo_estudio_jefe ~ '^[0-9]+$' THEN tiempo_estudio_jefe::INTEGER
    ELSE NULL
  END;

-- Agregar constraint de validación >= 0
ALTER TABLE familias_y_hogares
ADD CONSTRAINT familias_tiempo_estudio_jefe_check 
CHECK (tiempo_estudio_jefe IS NULL OR tiempo_estudio_jefe >= 0);

-- ==========================================================
-- 3. RECREAR VISTA view_solicitantes_completo
-- ==========================================================

CREATE VIEW view_solicitantes_completo AS
SELECT 
    s.*,
    -- Edad derivada: calculada desde fecha_nacimiento
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, s.fecha_nacimiento))::INTEGER AS edad
FROM solicitantes s;

COMMIT;

