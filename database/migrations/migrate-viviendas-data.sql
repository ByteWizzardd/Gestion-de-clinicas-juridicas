-- Script de migración de datos para actualizar los valores de viviendas
-- Este script debe ejecutarse ANTES de update-viviendas-domains.sql
-- Convierte los valores antiguos a los nuevos valores según el formulario oficial

-- ==========================================================
-- 1. MIGRAR MATERIAL_PISO
-- ==========================================================
-- Convertir: Granito, Parquet, Mármol -> Granito / Parquet / Mármol
UPDATE viviendas 
SET material_piso = 'Granito / Parquet / Mármol'
WHERE material_piso IN ('Granito', 'Parquet', 'Mármol');

-- ==========================================================
-- 2. MIGRAR MATERIAL_PAREDES
-- ==========================================================
-- Convertir: Cartón, Palma, Desechos -> Cartón / Palma / Desechos
UPDATE viviendas 
SET material_paredes = 'Cartón / Palma / Desechos'
WHERE material_paredes IN ('Cartón', 'Palma', 'Desechos');

-- ==========================================================
-- 3. MIGRAR MATERIAL_TECHO
-- ==========================================================
-- Convertir: Madera, Cartón -> Madera / Cartón / Palma
UPDATE viviendas 
SET material_techo = 'Madera / Cartón / Palma'
WHERE material_techo IN ('Madera', 'Cartón');

-- Convertir: Palma/Zinc -> Zinc / Acerolit (si contiene Zinc)
-- Nota: Si el valor es 'Palma/Zinc', lo convertimos a 'Zinc / Acerolit'
-- Si es solo 'Palma', ya se convirtió arriba
UPDATE viviendas 
SET material_techo = 'Zinc / Acerolit'
WHERE material_techo = 'Palma/Zinc';

-- Convertir: Acerolit -> Zinc / Acerolit
UPDATE viviendas 
SET material_techo = 'Zinc / Acerolit'
WHERE material_techo = 'Acerolit';

-- Convertir: Platabanda, Tejas -> Platabanda / Tejas
UPDATE viviendas 
SET material_techo = 'Platabanda / Tejas'
WHERE material_techo IN ('Platabanda', 'Tejas');

-- ==========================================================
-- 4. MIGRAR ELIMINACION_AGUAS_N
-- ==========================================================
-- Convertir: Poceta a cloaca, Pozo séptico -> Poceta a cloaca / Pozo séptico
UPDATE viviendas 
SET eliminacion_aguas_n = 'Poceta a cloaca / Pozo séptico'
WHERE eliminacion_aguas_n IN ('Poceta a cloaca', 'Pozo séptico');

-- Convertir: Excusado a hoyo o letrina -> Excusado de hoyo o letrina
UPDATE viviendas 
SET eliminacion_aguas_n = 'Excusado de hoyo o letrina'
WHERE eliminacion_aguas_n = 'Excusado a hoyo o letrina';

-- ==========================================================
-- 5. MIGRAR ASEO
-- ==========================================================
-- Convertir: No llega a la vivienda, Container -> No llega a la vivienda / Container
UPDATE viviendas 
SET aseo = 'No llega a la vivienda / Container'
WHERE aseo IN ('No llega a la vivienda', 'Container');

-- ==========================================================
-- VERIFICACIÓN (Opcional - comentar si no se necesita)
-- ==========================================================
-- Descomentar las siguientes líneas para verificar que todos los valores fueron migrados correctamente

-- SELECT DISTINCT material_piso FROM viviendas;
-- SELECT DISTINCT material_paredes FROM viviendas;
-- SELECT DISTINCT material_techo FROM viviendas;
-- SELECT DISTINCT eliminacion_aguas_n FROM viviendas;
-- SELECT DISTINCT aseo FROM viviendas;

