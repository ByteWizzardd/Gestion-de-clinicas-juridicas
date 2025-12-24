-- ==========================================================
-- MIGRACIÓN: Actualizar catálogos de condición de trabajo y actividad
-- ==========================================================
-- Esta migración actualiza los catálogos con los nuevos valores:
-- - Condición de trabajo: 0 no trabaja, 1 Patrono, 2 Empleado, 3 Obrero, 4 Cuenta propia
-- - Condición de actividad: 0 buscando trabajo, 1 Ama de Casa, 2 Estudiante, 3 Pensionado/Jubilado, 4 Otra
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- ==========================================================
-- 1. ACTUALIZAR CONDICIÓN TRABAJO
-- ==========================================================
-- Paso 1: Insertar/actualizar los nuevos valores en el catálogo PRIMERO
-- Esto asegura que los IDs 0-4 existan antes de actualizar referencias
INSERT INTO condicion_trabajo (id_trabajo, nombre_trabajo) VALUES
(0, 'No trabaja'),
(1, 'Patrono'),
(2, 'Empleado'),
(3, 'Obrero'),
(4, 'Cuenta propia')
ON CONFLICT (id_trabajo) DO UPDATE
SET nombre_trabajo = EXCLUDED.nombre_trabajo;

-- Paso 2: Actualizar referencias en solicitantes mapeando valores antiguos a los nuevos IDs
-- Mapear "Desempleado" y similares a "no trabaja" (id = 0)
UPDATE solicitantes s
SET id_trabajo = 0
WHERE EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo = s.id_trabajo 
    AND ct.nombre_trabajo IN ('Desempleado', 'No trabaja', 'Sin trabajo')
    AND ct.id_trabajo NOT IN (0, 1, 2, 3, 4)
);

-- Mapear "Patrono" a id = 1 (si el id actual no es 1)
UPDATE solicitantes s
SET id_trabajo = 1
WHERE EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo = s.id_trabajo 
    AND ct.nombre_trabajo = 'Patrono'
    AND ct.id_trabajo != 1
);

-- Mapear "Empleado" a id = 2 (si el id actual no es 2)
UPDATE solicitantes s
SET id_trabajo = 2
WHERE EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo = s.id_trabajo 
    AND ct.nombre_trabajo = 'Empleado'
    AND ct.id_trabajo != 2
);

-- Mapear "Obrero" a id = 3 (si el id actual no es 3)
UPDATE solicitantes s
SET id_trabajo = 3
WHERE EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo = s.id_trabajo 
    AND ct.nombre_trabajo = 'Obrero'
    AND ct.id_trabajo != 3
);

-- Mapear "Cuenta propia" a id = 4 (si el id actual no es 4)
UPDATE solicitantes s
SET id_trabajo = 4
WHERE EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo = s.id_trabajo 
    AND ct.nombre_trabajo = 'Cuenta propia'
    AND ct.id_trabajo != 4
);

-- Paso 3: Actualizar cualquier referencia restante que no coincida con los nuevos IDs a un valor por defecto
UPDATE solicitantes s
SET id_trabajo = 0
WHERE NOT EXISTS (
    SELECT 1 FROM condicion_trabajo ct 
    WHERE ct.id_trabajo IN (0, 1, 2, 3, 4)
    AND ct.id_trabajo = s.id_trabajo
);

-- Paso 4: Actualizar nombres de valores antiguos que aún existan
UPDATE condicion_trabajo 
SET nombre_trabajo = 'No trabaja'
WHERE nombre_trabajo IN ('Desempleado', 'No trabaja', 'Sin trabajo')
AND id_trabajo NOT IN (0, 1, 2, 3, 4);

-- Paso 5: Eliminar registros del catálogo que no se necesitan (después de actualizar todas las referencias)
DELETE FROM condicion_trabajo 
WHERE id_trabajo NOT IN (0, 1, 2, 3, 4);

-- Paso 6: Ajustar la secuencia para que el próximo ID sea 5
SELECT setval('condicion_trabajo_id_trabajo_seq', 4, true);

-- ==========================================================
-- 2. ACTUALIZAR CONDICIÓN ACTIVIDAD
-- ==========================================================
-- Paso 1: Insertar/actualizar los nuevos valores en el catálogo PRIMERO
-- Esto asegura que los IDs 0-4 existan antes de actualizar referencias
INSERT INTO condicion_actividad (id_actividad, nombre_actividad) VALUES
(0, 'Buscando trabajo'),
(1, 'Ama de Casa'),
(2, 'Estudiante'),
(3, 'Pensionado/Jubilado'),
(4, 'Otra')
ON CONFLICT (id_actividad) DO UPDATE
SET nombre_actividad = EXCLUDED.nombre_actividad;

-- Paso 2: Actualizar referencias en solicitantes mapeando valores antiguos a los nuevos IDs
-- Mapear "buscando trabajo" y similares a id = 0
UPDATE solicitantes s
SET id_actividad = 0
WHERE EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad = s.id_actividad 
    AND ca.nombre_actividad IN ('Buscando trabajo', 'Buscando Trabajo', 'buscando trabajo')
    AND ca.id_actividad NOT IN (0, 1, 2, 3, 4)
);

-- Mapear "Ama de Casa" a id = 1 (si el id actual no es 1)
UPDATE solicitantes s
SET id_actividad = 1
WHERE EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad = s.id_actividad 
    AND ca.nombre_actividad = 'Ama de Casa'
    AND ca.id_actividad != 1
);

-- Mapear "Estudiante" a id = 2 (si el id actual no es 2)
UPDATE solicitantes s
SET id_actividad = 2
WHERE EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad = s.id_actividad 
    AND ca.nombre_actividad = 'Estudiante'
    AND ca.id_actividad != 2
);

-- Mapear "Pensionado" y "Jubilado" a id = 3 (Pensionado/Jubilado)
UPDATE solicitantes s
SET id_actividad = 3
WHERE EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad = s.id_actividad 
    AND ca.nombre_actividad IN ('Pensionado', 'Jubilado')
    AND ca.id_actividad != 3
);

-- Mapear "Otra" a id = 4 (si el id actual no es 4)
UPDATE solicitantes s
SET id_actividad = 4
WHERE EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad = s.id_actividad 
    AND ca.nombre_actividad = 'Otra'
    AND ca.id_actividad != 4
);

-- Paso 3: Actualizar cualquier referencia restante que no coincida con los nuevos IDs a un valor por defecto
UPDATE solicitantes s
SET id_actividad = 1
WHERE NOT EXISTS (
    SELECT 1 FROM condicion_actividad ca 
    WHERE ca.id_actividad IN (0, 1, 2, 3, 4)
    AND ca.id_actividad = s.id_actividad
);

-- Paso 4: Actualizar nombres de valores antiguos que aún existan
UPDATE condicion_actividad 
SET nombre_actividad = 'Pensionado/Jubilado'
WHERE nombre_actividad IN ('Pensionado', 'Jubilado')
AND id_actividad NOT IN (0, 1, 2, 3, 4);

UPDATE condicion_actividad 
SET nombre_actividad = 'buscando trabajo'
WHERE nombre_actividad IN ('Buscando trabajo', 'Buscando Trabajo')
AND id_actividad NOT IN (0, 1, 2, 3, 4);

-- Paso 5: Eliminar registros del catálogo que no se necesitan (después de actualizar todas las referencias)
DELETE FROM condicion_actividad 
WHERE id_actividad NOT IN (0, 1, 2, 3, 4);

-- Paso 6: Ajustar la secuencia para que el próximo ID sea 5
SELECT setval('condicion_actividad_id_actividad_seq', 4, true);

COMMIT;

-- ==========================================================
-- FIN DE LA MIGRACIÓN
-- ==========================================================

