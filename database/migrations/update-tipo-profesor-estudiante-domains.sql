-- ==========================================================
-- MIGRACIÓN: Actualizar dominios de tipo_profesor y tipo_estudiante
-- ==========================================================
-- Esta migración actualiza los CHECK constraints para:
-- - tipo_profesor: 'Voluntario' o 'Asesor'
-- - tipo_estudiante: 'Voluntario', 'Inscrito', 'Egresado' o 'Servicio Comunitario'
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- ==========================================================
-- 1. ACTUALIZAR DATOS EXISTENTES EN PROFESORES
-- ==========================================================
-- Actualizar valores que no coinciden con el nuevo dominio
UPDATE profesores
SET tipo_profesor = 'Asesor'
WHERE tipo_profesor NOT IN ('Voluntario', 'Asesor')
   OR tipo_profesor IS NULL;

-- ==========================================================
-- 2. ACTUALIZAR DATOS EXISTENTES EN ESTUDIANTES
-- ==========================================================
-- Actualizar valores que no coinciden con el nuevo dominio
UPDATE estudiantes
SET tipo_estudiante = 'Inscrito'
WHERE tipo_estudiante NOT IN ('Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario')
   OR tipo_estudiante IS NULL;

-- ==========================================================
-- 3. ELIMINAR CHECK CONSTRAINTS EXISTENTES (si existen)
-- ==========================================================
-- Nota: PostgreSQL no permite eliminar un constraint por nombre si no sabemos su nombre exacto
-- Usamos DO block para intentar eliminarlo de forma segura
DO $$
BEGIN
    -- Intentar eliminar constraint de tipo_profesor si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname LIKE '%tipo_profesor%check%'
        AND conrelid = 'profesores'::regclass
    ) THEN
        ALTER TABLE profesores DROP CONSTRAINT IF EXISTS profesores_tipo_profesor_check;
    END IF;
    
    -- Intentar eliminar constraint de tipo_estudiante si existe
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname LIKE '%tipo_estudiante%check%'
        AND conrelid = 'estudiantes'::regclass
    ) THEN
        ALTER TABLE estudiantes DROP CONSTRAINT IF EXISTS estudiantes_tipo_estudiante_check;
    END IF;
END $$;

-- ==========================================================
-- 4. AGREGAR NUEVOS CHECK CONSTRAINTS
-- ==========================================================
-- Profesores: Voluntario o Asesor
ALTER TABLE profesores
ADD CONSTRAINT profesores_tipo_profesor_check 
CHECK (tipo_profesor IN ('Voluntario', 'Asesor'));

-- Estudiantes: Voluntario, Inscrito, Egresado o Servicio Comunitario
ALTER TABLE estudiantes
ADD CONSTRAINT estudiantes_tipo_estudiante_check 
CHECK (tipo_estudiante IN ('Voluntario', 'Inscrito', 'Egresado', 'Servicio Comunitario'));

COMMIT;

-- ==========================================================
-- FIN DE LA MIGRACIÓN
-- ==========================================================

