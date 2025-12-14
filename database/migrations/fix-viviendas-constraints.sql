-- Script de corrección para los constraints de viviendas
-- Este script verifica y corrige todos los constraints de viviendas
-- Úsalo si encuentras errores después de ejecutar las migraciones

-- ==========================================================
-- VERIFICAR Y CORREGIR MATERIAL_PISO
-- ==========================================================
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Buscar el constraint de material_piso
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'viviendas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%material_piso%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE viviendas DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    END IF;
END $$;

-- Asegurar que los datos estén migrados primero
UPDATE viviendas 
SET material_piso = 'Granito / Parquet / Mármol'
WHERE material_piso IN ('Granito', 'Parquet', 'Mármol');

-- Crear el nuevo constraint
ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_piso_check 
CHECK (material_piso IN ('Tierra', 'Cemento', 'Cerámica', 'Granito / Parquet / Mármol'));

-- ==========================================================
-- VERIFICAR Y CORREGIR MATERIAL_PAREDES
-- ==========================================================
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'viviendas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%material_paredes%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE viviendas DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    END IF;
END $$;

-- Asegurar que los datos estén migrados primero
UPDATE viviendas 
SET material_paredes = 'Cartón / Palma / Desechos'
WHERE material_paredes IN ('Cartón', 'Palma', 'Desechos');

-- Crear el nuevo constraint
ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_paredes_check 
CHECK (material_paredes IN ('Cartón / Palma / Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado'));

-- ==========================================================
-- VERIFICAR Y CORREGIR MATERIAL_TECHO
-- ==========================================================
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'viviendas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%material_techo%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE viviendas DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    END IF;
END $$;

-- Asegurar que los datos estén migrados primero
UPDATE viviendas 
SET material_techo = 'Madera / Cartón / Palma'
WHERE material_techo IN ('Madera', 'Cartón');

UPDATE viviendas 
SET material_techo = 'Zinc / Acerolit'
WHERE material_techo IN ('Palma/Zinc', 'Acerolit');

UPDATE viviendas 
SET material_techo = 'Platabanda / Tejas'
WHERE material_techo IN ('Platabanda', 'Tejas');

-- Crear el nuevo constraint
ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_techo_check 
CHECK (material_techo IN ('Madera / Cartón / Palma', 'Zinc / Acerolit', 'Platabanda / Tejas'));

-- ==========================================================
-- VERIFICAR Y CORREGIR ELIMINACION_AGUAS_N
-- ==========================================================
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'viviendas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%eliminacion_aguas_n%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE viviendas DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    END IF;
END $$;

-- Asegurar que los datos estén migrados primero
UPDATE viviendas 
SET eliminacion_aguas_n = 'Poceta a cloaca / Pozo séptico'
WHERE eliminacion_aguas_n IN ('Poceta a cloaca', 'Pozo séptico');

UPDATE viviendas 
SET eliminacion_aguas_n = 'Excusado de hoyo o letrina'
WHERE eliminacion_aguas_n = 'Excusado a hoyo o letrina';

-- Crear el nuevo constraint
ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_eliminacion_aguas_n_check 
CHECK (eliminacion_aguas_n IN ('Poceta a cloaca / Pozo séptico', 'Poceta sin conexión', 'Excusado de hoyo o letrina', 'No tiene'));

-- ==========================================================
-- VERIFICAR Y CORREGIR ASEO
-- ==========================================================
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'viviendas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%aseo%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE viviendas DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Constraint eliminado: %', constraint_name;
    END IF;
END $$;

-- Asegurar que los datos estén migrados primero
UPDATE viviendas 
SET aseo = 'No llega a la vivienda / Container'
WHERE aseo IN ('No llega a la vivienda', 'Container');

-- Crear el nuevo constraint
ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_aseo_check 
CHECK (aseo IN ('Llega a la vivienda', 'No llega a la vivienda / Container', 'No tiene'));

-- ==========================================================
-- VERIFICACIÓN FINAL
-- ==========================================================
-- Descomentar para verificar que todos los valores son correctos
-- SELECT DISTINCT material_piso FROM viviendas;
-- SELECT DISTINCT material_paredes FROM viviendas;
-- SELECT DISTINCT material_techo FROM viviendas;
-- SELECT DISTINCT eliminacion_aguas_n FROM viviendas;
-- SELECT DISTINCT aseo FROM viviendas;

