-- Migración para actualizar los dominios de los campos de vivienda
-- según el formulario oficial
--
-- IMPORTANTE: Ejecutar PRIMERO migrate-viviendas-data.sql para convertir
-- los datos existentes antes de aplicar estos nuevos constraints.

-- 1. Actualizar material_piso
-- Antes: 'Tierra', 'Cemento', 'Cerámica', 'Granito', 'Parquet', 'Mármol'
-- Después: 'Tierra', 'Cemento', 'Cerámica', 'Granito / Parquet / Mármol'
DO $$
DECLARE
    constraint_name text;
BEGIN
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

ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_piso_check 
CHECK (material_piso IN ('Tierra', 'Cemento', 'Cerámica', 'Granito / Parquet / Mármol'));

-- 2. Actualizar material_paredes
-- Antes: 'Cartón', 'Palma', 'Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado'
-- Después: 'Cartón / Palma / Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado'
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

ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_paredes_check 
CHECK (material_paredes IN ('Cartón / Palma / Desechos', 'Bahareque', 'Bloque sin frizar', 'Bloque frizado'));

-- 3. Actualizar material_techo
-- Antes: 'Madera', 'Cartón', 'Palma/Zinc', 'Acerolit', 'Platabanda', 'Tejas'
-- Después: 'Madera / Cartón / Palma', 'Zinc / Acerolit', 'Platabanda / Tejas'
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

ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_material_techo_check 
CHECK (material_techo IN ('Madera / Cartón / Palma', 'Zinc / Acerolit', 'Platabanda / Tejas'));

-- 4. Actualizar eliminacion_aguas_n
-- Antes: 'Poceta a cloaca', 'Pozo séptico', 'Poceta sin conexión', 'Excusado a hoyo o letrina', 'No tiene'
-- Después: 'Poceta a cloaca / Pozo séptico', 'Poceta sin conexión', 'Excusado de hoyo o letrina', 'No tiene'
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

ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_eliminacion_aguas_n_check 
CHECK (eliminacion_aguas_n IN ('Poceta a cloaca / Pozo séptico', 'Poceta sin conexión', 'Excusado de hoyo o letrina', 'No tiene'));

-- 5. Actualizar aseo
-- Antes: 'Llega a la vivienda', 'No llega a la vivienda', 'Container', 'No tiene'
-- Después: 'Llega a la vivienda', 'No llega a la vivienda / Container', 'No tiene'
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

ALTER TABLE viviendas 
ADD CONSTRAINT viviendas_aseo_check 
CHECK (aseo IN ('Llega a la vivienda', 'No llega a la vivienda / Container', 'No tiene'));

-- NOTA: Los datos existentes que no coincidan con los nuevos valores necesitarán ser actualizados manualmente
-- antes de aplicar esta migración, o se puede crear un script de migración de datos.

