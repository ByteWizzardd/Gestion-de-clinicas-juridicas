-- ============================================================
-- SCRIPT PARA ELIMINAR DUPLICADOS EN ESTADOS, MUNICIPIOS Y PARROQUIAS
-- ============================================================
-- Este script elimina registros duplicados manteniendo solo uno de cada conjunto
-- IMPORTANTE: Se mantiene el registro con el ID más bajo (más antiguo)
-- ============================================================
-- INSTRUCCIONES: Si obtienes un error de transacción abortada, ejecuta primero:
-- ROLLBACK;
-- Luego ejecuta este script completo.
-- ============================================================

-- Limpiar cualquier transacción abortada previa
DO $$
BEGIN
    -- Intentar hacer rollback si hay una transacción activa
    IF EXISTS (SELECT 1 FROM pg_stat_activity WHERE state LIKE '%aborted%') THEN
        ROLLBACK;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignorar si no hay transacción
END $$;

BEGIN;

-- Diferir la validación de foreign keys hasta el final de la transacción
SET CONSTRAINTS ALL DEFERRED;

-- ============================================================
-- 1. ELIMINAR DUPLICADOS EN ESTADOS
-- ============================================================
-- Estrategia: 
-- 1. Identificar estados a mantener (el que tiene el id_estado más bajo)
-- 2. Para cada municipio que referencia un estado duplicado:
--    a. Si NO existe un municipio con el mismo num_municipio en el estado destino: actualizar el municipio
--    b. Si SÍ existe: actualizar todas las referencias (parroquias, solicitantes, nucleos) al municipio del estado destino, luego eliminar el municipio duplicado
-- 3. Eliminar estados duplicados

-- Crear tabla temporal con los estados a mantener (el que tiene el id_estado más bajo)
CREATE TEMP TABLE estados_a_mantener AS
SELECT DISTINCT ON (nombre_estado)
    id_estado,
    nombre_estado
FROM estados
ORDER BY nombre_estado, id_estado;

-- ============================================================
-- PASO 1: Actualizar municipios que NO crearán duplicados
-- ============================================================
UPDATE municipios m
SET id_estado = e2.id_estado
FROM estados e1
JOIN estados_a_mantener e2 
    ON e1.nombre_estado = e2.nombre_estado
WHERE m.id_estado = e1.id_estado
    AND e1.id_estado != e2.id_estado
    AND NOT EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m.num_municipio
    );

-- ============================================================
-- PASO 2: Para municipios que SÍ crearían duplicados, actualizar todas las referencias
-- ============================================================

-- 2a. Actualizar parroquias que referencian municipios duplicados
UPDATE parroquias p
SET id_estado = e2.id_estado,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados e1 ON m_origen.id_estado = e1.id_estado
JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE p.id_estado = m_origen.id_estado
    AND p.num_municipio = m_origen.num_municipio
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        -- Verificar que SÍ existe un municipio equivalente en el estado destino
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m_origen.num_municipio
        AND m2.nombre_municipio = m_origen.nombre_municipio
    )
    AND NOT EXISTS (
        -- Verificar que no exista ya una parroquia con la misma clave primaria en el destino
        SELECT 1 FROM parroquias p2
        WHERE p2.id_estado = e2.id_estado
        AND p2.num_municipio = m_destino.num_municipio
        AND p2.num_parroquia = p.num_parroquia
    );

-- 2b. Para parroquias que crearían duplicados, actualizar referencias y eliminar duplicadas
UPDATE solicitantes s
SET id_estado = e2.id_estado,
    num_municipio = m_destino.num_municipio,
    num_parroquia = COALESCE(p_destino.num_parroquia, s.num_parroquia)
FROM municipios m_origen
JOIN estados e1 ON m_origen.id_estado = e1.id_estado
JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
LEFT JOIN parroquias p_origen ON p_origen.id_estado = m_origen.id_estado 
    AND p_origen.num_municipio = m_origen.num_municipio
LEFT JOIN parroquias p_destino ON p_destino.id_estado = e2.id_estado
    AND p_destino.num_municipio = m_destino.num_municipio
    AND p_destino.num_parroquia = p_origen.num_parroquia
    AND p_destino.nombre_parroquia = p_origen.nombre_parroquia
WHERE s.id_estado = m_origen.id_estado
    AND s.num_municipio = m_origen.num_municipio
    AND (p_origen.num_parroquia = s.num_parroquia OR p_origen.num_parroquia IS NULL)
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m_origen.num_municipio
    );

UPDATE nucleos n
SET id_estado = e2.id_estado,
    num_municipio = m_destino.num_municipio,
    num_parroquia = COALESCE(p_destino.num_parroquia, n.num_parroquia)
FROM municipios m_origen
JOIN estados e1 ON m_origen.id_estado = e1.id_estado
JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
LEFT JOIN parroquias p_origen ON p_origen.id_estado = m_origen.id_estado 
    AND p_origen.num_municipio = m_origen.num_municipio
LEFT JOIN parroquias p_destino ON p_destino.id_estado = e2.id_estado
    AND p_destino.num_municipio = m_destino.num_municipio
    AND p_destino.num_parroquia = p_origen.num_parroquia
    AND p_destino.nombre_parroquia = p_origen.nombre_parroquia
WHERE n.id_estado = m_origen.id_estado
    AND n.num_municipio = m_origen.num_municipio
    AND (p_origen.num_parroquia = n.num_parroquia OR p_origen.num_parroquia IS NULL)
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m_origen.num_municipio
    );

-- 2c. Eliminar parroquias duplicadas que ya tienen una equivalente en el estado destino
DELETE FROM parroquias p_origen
WHERE EXISTS (
    SELECT 1 FROM municipios m_origen
    JOIN estados e1 ON m_origen.id_estado = e1.id_estado
    JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
    JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
        AND m_destino.num_municipio = m_origen.num_municipio
        AND m_destino.nombre_municipio = m_origen.nombre_municipio
    WHERE p_origen.id_estado = m_origen.id_estado
        AND p_origen.num_municipio = m_origen.num_municipio
        AND e1.id_estado != e2.id_estado
        AND EXISTS (
            SELECT 1 FROM parroquias p_destino
            WHERE p_destino.id_estado = e2.id_estado
            AND p_destino.num_municipio = m_destino.num_municipio
            AND p_destino.num_parroquia = p_origen.num_parroquia
            AND p_destino.nombre_parroquia = p_origen.nombre_parroquia
        )
);

-- 2d. Actualizar solicitantes que referencian municipios duplicados (sin parroquias)
UPDATE solicitantes s
SET id_estado = e2.id_estado,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados e1 ON m_origen.id_estado = e1.id_estado
JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE s.id_estado = m_origen.id_estado
    AND s.num_municipio = m_origen.num_municipio
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m_origen.num_municipio
    );

-- 2e. Actualizar nucleos que referencian municipios duplicados (sin parroquias)
UPDATE nucleos n
SET id_estado = e2.id_estado,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados e1 ON m_origen.id_estado = e1.id_estado
JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
JOIN municipios m_destino ON m_destino.id_estado = e2.id_estado 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE n.id_estado = m_origen.id_estado
    AND n.num_municipio = m_origen.num_municipio
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m_origen.num_municipio
    );

-- ============================================================
-- PASO 3: Actualizar parroquias que todavía referencian estados duplicados
-- (casos donde el municipio ya fue actualizado en el paso 1)
-- ============================================================
UPDATE parroquias p
SET id_estado = e2.id_estado
FROM estados e1
JOIN estados_a_mantener e2 
    ON e1.nombre_estado = e2.nombre_estado
WHERE p.id_estado = e1.id_estado
    AND e1.id_estado != e2.id_estado
    AND NOT EXISTS (
        SELECT 1 FROM parroquias p2
        WHERE p2.id_estado = e2.id_estado
        AND p2.num_municipio = p.num_municipio
        AND p2.num_parroquia = p.num_parroquia
    );

-- ============================================================
-- PASO 4: Actualizar solicitantes y nucleos que todavía referencian estados duplicados
-- ============================================================
UPDATE solicitantes s
SET id_estado = e2.id_estado
FROM estados e1
JOIN estados_a_mantener e2 
    ON e1.nombre_estado = e2.nombre_estado
WHERE s.id_estado = e1.id_estado
    AND e1.id_estado != e2.id_estado;

UPDATE nucleos n
SET id_estado = e2.id_estado
FROM estados e1
JOIN estados_a_mantener e2 
    ON e1.nombre_estado = e2.nombre_estado
WHERE n.id_estado = e1.id_estado
    AND e1.id_estado != e2.id_estado;

-- ============================================================
-- PASO 5: Eliminar municipios duplicados que ya no tienen referencias
-- ============================================================
DELETE FROM municipios m
WHERE EXISTS (
    SELECT 1 FROM estados e1
    JOIN estados_a_mantener e2 ON e1.nombre_estado = e2.nombre_estado
    WHERE m.id_estado = e1.id_estado
    AND e1.id_estado != e2.id_estado
    AND EXISTS (
        -- Verificar que existe un municipio equivalente en el estado destino
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = e2.id_estado
        AND m2.num_municipio = m.num_municipio
        AND m2.nombre_municipio = m.nombre_municipio
    )
)
-- Verificar que no hay parroquias que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM parroquias p
    WHERE p.id_estado = m.id_estado
    AND p.num_municipio = m.num_municipio
)
-- Verificar que no hay solicitantes que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM solicitantes s
    WHERE s.id_estado = m.id_estado
    AND s.num_municipio = m.num_municipio
)
-- Verificar que no hay nucleos que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM nucleos n
    WHERE n.id_estado = m.id_estado
    AND n.num_municipio = m.num_municipio
);

-- ============================================================
-- PASO 6: Eliminar estados duplicados (solo los que no se están usando)
-- ============================================================
DELETE FROM estados e1
WHERE NOT EXISTS (
    SELECT 1 FROM estados_a_mantener e2
    WHERE e2.id_estado = e1.id_estado
)
-- Verificar que no hay municipios que todavía referencien este estado
AND NOT EXISTS (
    SELECT 1 FROM municipios m
    WHERE m.id_estado = e1.id_estado
)
-- Verificar que no hay parroquias que todavía referencien este estado
AND NOT EXISTS (
    SELECT 1 FROM parroquias p
    WHERE p.id_estado = e1.id_estado
)
-- Verificar que no hay solicitantes que todavía referencien este estado
AND NOT EXISTS (
    SELECT 1 FROM solicitantes s
    WHERE s.id_estado = e1.id_estado
)
-- Verificar que no hay nucleos que todavía referencien este estado
AND NOT EXISTS (
    SELECT 1 FROM nucleos n
    WHERE n.id_estado = e1.id_estado
);

DROP TABLE IF EXISTS estados_a_mantener;

-- ============================================================
-- 2. ELIMINAR DUPLICADOS EN MUNICIPIOS
-- ============================================================
-- Estrategia: Actualizar todas las referencias primero, luego eliminar duplicados

-- Crear tabla temporal con los municipios a mantener (el que tiene el num_municipio más bajo)
CREATE TEMP TABLE municipios_a_mantener AS
SELECT DISTINCT ON (id_estado, nombre_municipio)
    id_estado,
    num_municipio,
    nombre_municipio
FROM municipios
ORDER BY id_estado, nombre_municipio, num_municipio;

-- Actualizar PARROQUIAS para que apunten a los municipios correctos
-- Solo si no crea duplicados en la clave primaria
UPDATE parroquias p
SET num_municipio = m2.num_municipio
FROM municipios m1
JOIN municipios_a_mantener m2 
    ON m1.id_estado = m2.id_estado 
    AND m1.nombre_municipio = m2.nombre_municipio
WHERE p.id_estado = m1.id_estado 
    AND p.num_municipio = m1.num_municipio
    AND m1.num_municipio != m2.num_municipio
    AND NOT EXISTS (
        SELECT 1 FROM parroquias p2
        WHERE p2.id_estado = m2.id_estado
        AND p2.num_municipio = m2.num_municipio
        AND p2.num_parroquia = p.num_parroquia
    );

-- Actualizar SOLICITANTES para que apunten a los municipios correctos
UPDATE solicitantes s
SET num_municipio = m2.num_municipio
FROM municipios m1
JOIN municipios_a_mantener m2 
    ON m1.id_estado = m2.id_estado 
    AND m1.nombre_municipio = m2.nombre_municipio
WHERE s.id_estado = m1.id_estado 
    AND s.num_municipio = m1.num_municipio
    AND m1.num_municipio != m2.num_municipio;

-- Actualizar NUCLEOS para que apunten a los municipios correctos
UPDATE nucleos n
SET num_municipio = m2.num_municipio
FROM municipios m1
JOIN municipios_a_mantener m2 
    ON m1.id_estado = m2.id_estado 
    AND m1.nombre_municipio = m2.nombre_municipio
WHERE n.id_estado = m1.id_estado 
    AND n.num_municipio = m1.num_municipio
    AND m1.num_municipio != m2.num_municipio;

-- Eliminar municipios duplicados
DELETE FROM municipios m1
WHERE NOT EXISTS (
    SELECT 1 FROM municipios_a_mantener m2
    WHERE m2.id_estado = m1.id_estado
    AND m2.num_municipio = m1.num_municipio
);

DROP TABLE IF EXISTS municipios_a_mantener;

-- ============================================================
-- 3. ELIMINAR DUPLICADOS EN PARROQUIAS
-- ============================================================
-- Estrategia: Actualizar todas las referencias primero, luego eliminar duplicados

-- Crear tabla temporal con las parroquias a mantener (la que tiene el num_parroquia más bajo)
CREATE TEMP TABLE parroquias_a_mantener AS
SELECT DISTINCT ON (id_estado, num_municipio, nombre_parroquia)
    id_estado,
    num_municipio,
    num_parroquia,
    nombre_parroquia
FROM parroquias
ORDER BY id_estado, num_municipio, nombre_parroquia, num_parroquia;

-- Actualizar SOLICITANTES para que apunten a las parroquias correctas
UPDATE solicitantes s
SET num_parroquia = p2.num_parroquia
FROM parroquias p1
JOIN parroquias_a_mantener p2 
    ON p1.id_estado = p2.id_estado 
    AND p1.num_municipio = p2.num_municipio
    AND p1.nombre_parroquia = p2.nombre_parroquia
WHERE s.id_estado = p1.id_estado 
    AND s.num_municipio = p1.num_municipio
    AND s.num_parroquia = p1.num_parroquia
    AND p1.num_parroquia != p2.num_parroquia;

-- Actualizar NUCLEOS para que apunten a las parroquias correctas
UPDATE nucleos n
SET num_parroquia = p2.num_parroquia
FROM parroquias p1
JOIN parroquias_a_mantener p2 
    ON p1.id_estado = p2.id_estado 
    AND p1.num_municipio = p2.num_municipio
    AND p1.nombre_parroquia = p2.nombre_parroquia
WHERE n.id_estado = p1.id_estado 
    AND n.num_municipio = p1.num_municipio
    AND n.num_parroquia = p1.num_parroquia
    AND p1.num_parroquia != p2.num_parroquia;

-- Eliminar parroquias duplicadas
DELETE FROM parroquias p1
WHERE NOT EXISTS (
    SELECT 1 FROM parroquias_a_mantener p2
    WHERE p2.id_estado = p1.id_estado
    AND p2.num_municipio = p1.num_municipio
    AND p2.num_parroquia = p1.num_parroquia
);

DROP TABLE IF EXISTS parroquias_a_mantener;

COMMIT;

-- ============================================================
-- VERIFICACIÓN: Mostrar conteos finales
-- ============================================================
SELECT 'Estados' as tabla, COUNT(*) as total, COUNT(DISTINCT nombre_estado) as unicos FROM estados
UNION ALL
SELECT 'Municipios', COUNT(*), COUNT(DISTINCT (id_estado, nombre_municipio)) FROM municipios
UNION ALL
SELECT 'Parroquias', COUNT(*), COUNT(DISTINCT (id_estado, num_municipio, nombre_parroquia)) FROM parroquias;
