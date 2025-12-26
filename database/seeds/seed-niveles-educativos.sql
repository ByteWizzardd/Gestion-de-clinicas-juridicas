-- ==========================================================
-- SCRIPT DE CARGA DE NIVELES EDUCATIVOS
-- ==========================================================
-- Este script limpia TODOS los niveles educativos existentes
-- y crea solo los 7 niveles educativos básicos:
-- 1. Sin Nivel
-- 2. Primaria
-- 3. Básica
-- 4. Media Diversificada
-- 5. Técnico Medio
-- 6. Técnico Superior
-- 7. Universitaria
-- 
-- IMPORTANTE: 
-- - Elimina TODOS los niveles educativos existentes
-- - Actualiza todas las relaciones (solicitantes, familias_y_hogares)
-- - Inserta solo los 7 niveles básicos
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

-- Iniciar nueva transacción
BEGIN;

-- Diferir las restricciones de foreign key para poder actualizar las relaciones
SET CONSTRAINTS ALL DEFERRED;

-- ==========================================================
-- 1. CREAR TABLA TEMPORAL PARA MAPEO
-- ==========================================================
-- Crear una tabla temporal para guardar el mapeo de IDs antiguos a nuevas descripciones
CREATE TEMP TABLE temp_nivel_mapping AS
SELECT 
    ne.id_nivel_educativo AS old_id,
    CASE 
        WHEN LOWER(ne.descripcion) LIKE '%sin nivel%' THEN 'Sin Nivel'
        WHEN LOWER(ne.descripcion) LIKE '%primaria%' THEN 'Primaria'
        WHEN (LOWER(ne.descripcion) LIKE '%básica%' OR LOWER(ne.descripcion) LIKE '%basica%')
             AND LOWER(ne.descripcion) NOT LIKE '%media%' THEN 'Básica'
        WHEN LOWER(ne.descripcion) LIKE '%secundaria%' OR LOWER(ne.descripcion) LIKE '%media%' THEN 'Media Diversificada'
        WHEN (LOWER(ne.descripcion) LIKE '%técnico medio%' OR LOWER(ne.descripcion) LIKE '%tecnico medio%')
             AND LOWER(ne.descripcion) NOT LIKE '%superior%' THEN 'Técnico Medio'
        WHEN LOWER(ne.descripcion) LIKE '%técnico superior%' OR LOWER(ne.descripcion) LIKE '%tecnico superior%' THEN 'Técnico Superior'
        WHEN LOWER(ne.descripcion) LIKE '%universitaria%' 
             OR LOWER(ne.descripcion) LIKE '%universidad%'
             OR LOWER(ne.descripcion) LIKE '%postgrado%' THEN 'Universitaria'
        ELSE 'Sin Nivel' -- Fallback
    END AS new_descripcion
FROM niveles_educativos ne;

-- Crear tabla temporal para guardar los IDs de solicitantes antes de actualizar
CREATE TEMP TABLE temp_solicitantes_mapping AS
SELECT 
    s.cedula,
    s.id_nivel_educativo AS old_id
FROM solicitantes s;

-- Crear tabla temporal para guardar los IDs de familias_y_hogares antes de actualizar
CREATE TEMP TABLE temp_familias_mapping AS
SELECT 
    f.cedula_solicitante,
    f.id_nivel_educativo_jefe AS old_id
FROM familias_y_hogares f
WHERE f.id_nivel_educativo_jefe IS NOT NULL;

-- ==========================================================
-- 2. INSERTAR LOS 7 NIVELES EDUCATIVOS BÁSICOS (con IDs temporales altos)
-- ==========================================================
-- Insertar con IDs altos (1000+) para evitar conflictos con los existentes
INSERT INTO niveles_educativos (id_nivel_educativo, descripcion) VALUES
(1001, 'Sin Nivel'),
(1002, 'Primaria'),
(1003, 'Básica'),
(1004, 'Media Diversificada'),
(1005, 'Técnico Medio'),
(1006, 'Técnico Superior'),
(1007, 'Universitaria');

-- ==========================================================
-- 3. ACTUALIZAR RELACIONES EN SOLICITANTES
-- ==========================================================
-- Actualizar TODOS los solicitantes usando el mapeo guardado
-- Si no hay mapeo o el nivel antiguo no existe, usar 'Sin Nivel' (1001)
UPDATE solicitantes s
SET id_nivel_educativo = COALESCE((
    SELECT ne.id_nivel_educativo 
    FROM niveles_educativos ne
    INNER JOIN temp_nivel_mapping tnm ON ne.descripcion = tnm.new_descripcion
    INNER JOIN temp_solicitantes_mapping tsm ON tsm.cedula = s.cedula
    WHERE tnm.old_id = tsm.old_id
    LIMIT 1
), 1001); -- 1001 = 'Sin Nivel'

-- Asegurar que TODOS los solicitantes tengan un nivel educativo válido (1001-1007)
-- Esto cubre casos donde el nivel antiguo no estaba en temp_nivel_mapping
UPDATE solicitantes
SET id_nivel_educativo = 1001 -- 'Sin Nivel'
WHERE id_nivel_educativo IS NULL 
   OR id_nivel_educativo NOT BETWEEN 1001 AND 1007;

-- ==========================================================
-- 4. ACTUALIZAR RELACIONES EN FAMILIAS_Y_HOGARES
-- ==========================================================
-- Actualizar usando el mapeo guardado en la tabla temporal
UPDATE familias_y_hogares f
SET id_nivel_educativo_jefe = COALESCE((
    SELECT ne.id_nivel_educativo 
    FROM niveles_educativos ne
    INNER JOIN temp_nivel_mapping tnm ON ne.descripcion = tnm.new_descripcion
    INNER JOIN temp_familias_mapping tfm ON tfm.cedula_solicitante = f.cedula_solicitante
    WHERE tnm.old_id = tfm.old_id
    LIMIT 1
), NULL) -- NULL es válido para familias_y_hogares (puede ser NULL)
WHERE EXISTS (
    SELECT 1 FROM temp_familias_mapping tfm
    WHERE tfm.cedula_solicitante = f.cedula_solicitante
);

-- Actualizar TODAS las familias que tengan un id_nivel_educativo_jefe que no esté en el rango 1001-1007
-- Esto cubre casos donde la familia no estaba en temp_familias_mapping o el mapeo falló
UPDATE familias_y_hogares
SET id_nivel_educativo_jefe = NULL
WHERE id_nivel_educativo_jefe IS NOT NULL
   AND (id_nivel_educativo_jefe < 1000 
        OR id_nivel_educativo_jefe > 1007
        OR id_nivel_educativo_jefe NOT IN (SELECT id_nivel_educativo FROM niveles_educativos));

-- ==========================================================
-- 5. VERIFICAR Y ACTUALIZAR SOLICITANTES Y FAMILIAS_Y_HOGARES QUE AÚN TIENEN IDs ANTIGUOS
-- ==========================================================
-- Asegurar que TODOS los solicitantes apunten a los nuevos niveles (1001-1007)
-- Esto cubre cualquier caso edge donde el mapeo no funcionó
UPDATE solicitantes
SET id_nivel_educativo = 1001 -- 'Sin Nivel' por defecto
WHERE id_nivel_educativo IS NULL 
   OR id_nivel_educativo < 1000 
   OR id_nivel_educativo > 1007
   OR id_nivel_educativo NOT IN (SELECT id_nivel_educativo FROM niveles_educativos);

-- Asegurar que TODAS las familias_y_hogares apunten a los nuevos niveles (1001-1007) o NULL
-- Actualizar cualquier familia que tenga un ID que no esté entre 1001-1007
UPDATE familias_y_hogares
SET id_nivel_educativo_jefe = NULL -- NULL es válido para familias_y_hogares
WHERE id_nivel_educativo_jefe IS NOT NULL
   AND (id_nivel_educativo_jefe < 1000 
        OR id_nivel_educativo_jefe > 1007
        OR id_nivel_educativo_jefe NOT IN (SELECT id_nivel_educativo FROM niveles_educativos));

-- ==========================================================
-- 6. ELIMINAR TODOS LOS NIVELES EDUCATIVOS ANTIGUOS
-- ==========================================================
-- Ahora que todas las relaciones apuntan a los nuevos niveles, podemos eliminar los antiguos
DELETE FROM niveles_educativos
WHERE id_nivel_educativo < 1000;

-- ==========================================================
-- 7. INSERTAR LOS NIVELES CON IDs CORRECTOS (1-7) ANTES DE ACTUALIZAR REFERENCIAS
-- ==========================================================
-- Insertar los niveles con IDs 1-7 (los temporales 1001-1007 todavía existen)
INSERT INTO niveles_educativos (id_nivel_educativo, descripcion) VALUES
(1, 'Sin Nivel'),
(2, 'Primaria'),
(3, 'Básica'),
(4, 'Media Diversificada'),
(5, 'Técnico Medio'),
(6, 'Técnico Superior'),
(7, 'Universitaria');

-- ==========================================================
-- 8. ACTUALIZAR REFERENCIAS DE IDs TEMPORALES (1001-1007) A IDs FINALES (1-7)
-- ==========================================================
-- Actualizar las relaciones en solicitantes de IDs temporales a IDs finales
UPDATE solicitantes
SET id_nivel_educativo = CASE id_nivel_educativo
    WHEN 1001 THEN 1
    WHEN 1002 THEN 2
    WHEN 1003 THEN 3
    WHEN 1004 THEN 4
    WHEN 1005 THEN 5
    WHEN 1006 THEN 6
    WHEN 1007 THEN 7
    ELSE 1 -- Fallback a 'Sin Nivel'
END
WHERE id_nivel_educativo >= 1000;

-- Actualizar las relaciones en familias_y_hogares de IDs temporales a IDs finales
UPDATE familias_y_hogares
SET id_nivel_educativo_jefe = CASE id_nivel_educativo_jefe
    WHEN 1001 THEN 1
    WHEN 1002 THEN 2
    WHEN 1003 THEN 3
    WHEN 1004 THEN 4
    WHEN 1005 THEN 5
    WHEN 1006 THEN 6
    WHEN 1007 THEN 7
END
WHERE id_nivel_educativo_jefe >= 1000;

-- ==========================================================
-- 9. VERIFICAR Y ACTUALIZAR CUALQUIER REFERENCIA RESTANTE A IDs TEMPORALES
-- ==========================================================
-- Asegurar que ningún solicitante o familia tenga referencias a los IDs temporales
-- Esto es una verificación de seguridad antes de eliminar los temporales
UPDATE solicitantes
SET id_nivel_educativo = 1 -- 'Sin Nivel'
WHERE id_nivel_educativo >= 1000;

UPDATE familias_y_hogares
SET id_nivel_educativo_jefe = NULL
WHERE id_nivel_educativo_jefe >= 1000;

-- ==========================================================
-- 10. ELIMINAR LOS NIVELES TEMPORALES (1001-1007)
-- ==========================================================
-- Ahora que todas las referencias apuntan a los IDs finales (1-7), podemos eliminar los temporales
DELETE FROM niveles_educativos
WHERE id_nivel_educativo >= 1000;

-- Asegurar que todos los solicitantes tengan un nivel educativo válido
UPDATE solicitantes
SET id_nivel_educativo = 1
WHERE id_nivel_educativo IS NULL 
   OR id_nivel_educativo NOT IN (SELECT id_nivel_educativo FROM niveles_educativos);

-- Ajustar la secuencia para que el próximo ID sea 8
SELECT setval('niveles_educativos_id_nivel_educativo_seq', 7, true);

-- Limpiar tablas temporales
DROP TABLE IF EXISTS temp_nivel_mapping;
DROP TABLE IF EXISTS temp_solicitantes_mapping;
DROP TABLE IF EXISTS temp_familias_mapping;

-- Finalizar transacción
COMMIT;
