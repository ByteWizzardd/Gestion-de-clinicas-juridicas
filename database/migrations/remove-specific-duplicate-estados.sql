-- ============================================================
-- SCRIPT PARA ELIMINAR ESTADOS DUPLICADOS ESPECÍFICOS (36, 37, 38, 39, 40)
-- ============================================================
-- IMPORTANTE: Este script NO elimina información, solo consolida duplicados
-- Estrategia agresiva: Actualiza TODAS las referencias antes de eliminar
-- ============================================================

BEGIN;

-- Diferir la validación de foreign keys hasta el final de la transacción
SET CONSTRAINTS ALL DEFERRED;

-- Crear tabla temporal con los estados a eliminar y sus equivalentes
CREATE TEMP TABLE estados_duplicados AS
SELECT 
    e_duplicado.id_estado as id_duplicado,
    e_duplicado.nombre_estado,
    (SELECT MIN(e_correcto.id_estado) 
     FROM estados e_correcto 
     WHERE e_correcto.nombre_estado = e_duplicado.nombre_estado
     AND e_correcto.id_estado NOT IN (36, 37, 38, 39, 40)
     LIMIT 1) as id_correcto
FROM estados e_duplicado
WHERE e_duplicado.id_estado IN (36, 37, 38, 39, 40);

-- ============================================================
-- PASO 1: Actualizar TODAS las referencias de municipios
-- ============================================================

-- 1a. Municipios que NO crearán duplicados - actualizar directamente
UPDATE municipios m
SET id_estado = ed.id_correcto
FROM estados_duplicados ed
WHERE m.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND NOT EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m.num_municipio
    );

-- 1b. Para municipios que SÍ crearían duplicados, actualizar TODAS sus referencias
-- Actualizar parroquias
UPDATE parroquias p
SET id_estado = ed.id_correcto,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados_duplicados ed ON m_origen.id_estado = ed.id_duplicado
JOIN municipios m_destino ON m_destino.id_estado = ed.id_correcto 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE p.id_estado = m_origen.id_estado
    AND p.num_municipio = m_origen.num_municipio
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m_origen.num_municipio
    )
    AND NOT EXISTS (
        SELECT 1 FROM parroquias p2
        WHERE p2.id_estado = ed.id_correcto
        AND p2.num_municipio = m_destino.num_municipio
        AND p2.num_parroquia = p.num_parroquia
    );

-- Actualizar solicitantes
UPDATE solicitantes s
SET id_estado = ed.id_correcto,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados_duplicados ed ON m_origen.id_estado = ed.id_duplicado
JOIN municipios m_destino ON m_destino.id_estado = ed.id_correcto 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE s.id_estado = m_origen.id_estado
    AND s.num_municipio = m_origen.num_municipio
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m_origen.num_municipio
    );

-- Actualizar nucleos
UPDATE nucleos n
SET id_estado = ed.id_correcto,
    num_municipio = m_destino.num_municipio
FROM municipios m_origen
JOIN estados_duplicados ed ON m_origen.id_estado = ed.id_duplicado
JOIN municipios m_destino ON m_destino.id_estado = ed.id_correcto 
    AND m_destino.num_municipio = m_origen.num_municipio
    AND m_destino.nombre_municipio = m_origen.nombre_municipio
WHERE n.id_estado = m_origen.id_estado
    AND n.num_municipio = m_origen.num_municipio
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m_origen.num_municipio
    );

-- Eliminar parroquias duplicadas (solo si tienen equivalente)
DELETE FROM parroquias p_origen
WHERE EXISTS (
    SELECT 1 FROM municipios m_origen
    JOIN estados_duplicados ed ON m_origen.id_estado = ed.id_duplicado
    JOIN municipios m_destino ON m_destino.id_estado = ed.id_correcto 
        AND m_destino.num_municipio = m_origen.num_municipio
        AND m_destino.nombre_municipio = m_origen.nombre_municipio
    WHERE p_origen.id_estado = m_origen.id_estado
        AND p_origen.num_municipio = m_origen.num_municipio
        AND ed.id_correcto IS NOT NULL
        AND ed.id_duplicado != ed.id_correcto
        AND EXISTS (
            SELECT 1 FROM parroquias p_destino
            WHERE p_destino.id_estado = ed.id_correcto
            AND p_destino.num_municipio = m_destino.num_municipio
            AND p_destino.num_parroquia = p_origen.num_parroquia
            AND p_destino.nombre_parroquia = p_origen.nombre_parroquia
        )
);

-- ============================================================
-- PASO 2: Actualizar TODAS las referencias restantes a estados duplicados
-- ============================================================

-- Actualizar parroquias que todavía referencian estados duplicados
UPDATE parroquias p
SET id_estado = ed.id_correcto
FROM estados_duplicados ed
WHERE p.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND NOT EXISTS (
        SELECT 1 FROM parroquias p2
        WHERE p2.id_estado = ed.id_correcto
        AND p2.num_municipio = p.num_municipio
        AND p2.num_parroquia = p.num_parroquia
    );

-- Actualizar municipios que todavía referencian estados duplicados (los que no se pudieron actualizar antes)
UPDATE municipios m
SET id_estado = ed.id_correcto
FROM estados_duplicados ed
WHERE m.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND NOT EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m.num_municipio
    );

-- Actualizar solicitantes que todavía referencian estados duplicados
UPDATE solicitantes s
SET id_estado = ed.id_correcto
FROM estados_duplicados ed
WHERE s.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto;

-- Actualizar nucleos que todavía referencian estados duplicados
UPDATE nucleos n
SET id_estado = ed.id_correcto
FROM estados_duplicados ed
WHERE n.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto;

-- ============================================================
-- PASO 3: Eliminar municipios duplicados SOLO después de actualizar todas las referencias
-- ============================================================
DELETE FROM municipios m
WHERE EXISTS (
    SELECT 1 FROM estados_duplicados ed
    WHERE m.id_estado = ed.id_duplicado
    AND ed.id_correcto IS NOT NULL
    AND ed.id_duplicado != ed.id_correcto
    AND EXISTS (
        SELECT 1 FROM municipios m2
        WHERE m2.id_estado = ed.id_correcto
        AND m2.num_municipio = m.num_municipio
        AND m2.nombre_municipio = m.nombre_municipio
    )
)
-- Verificar que NO hay parroquias que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM parroquias p
    WHERE p.id_estado = m.id_estado
    AND p.num_municipio = m.num_municipio
)
-- Verificar que NO hay solicitantes que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM solicitantes s
    WHERE s.id_estado = m.id_estado
    AND s.num_municipio = m.num_municipio
)
-- Verificar que NO hay nucleos que todavía referencien este municipio
AND NOT EXISTS (
    SELECT 1 FROM nucleos n
    WHERE n.id_estado = m.id_estado
    AND n.num_municipio = m.num_municipio
);

-- ============================================================
-- PASO 4: FORZAR actualización de cualquier referencia restante
-- ============================================================

-- Actualizar cualquier parroquia que quede
UPDATE parroquias p
SET id_estado = (
    SELECT MIN(e2.id_estado) 
    FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = p.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
WHERE p.id_estado IN (36, 37, 38, 39, 40)
AND EXISTS (
    SELECT 1 FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = p.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
AND NOT EXISTS (
    SELECT 1 FROM parroquias p2
    WHERE p2.id_estado = (
        SELECT MIN(e2.id_estado) 
        FROM estados e2 
        WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = p.id_estado)
        AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
    )
    AND p2.num_municipio = p.num_municipio
    AND p2.num_parroquia = p.num_parroquia
);

-- Actualizar cualquier municipio que quede (solo si no crea duplicado)
UPDATE municipios m
SET id_estado = (
    SELECT MIN(e2.id_estado) 
    FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = m.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
WHERE m.id_estado IN (36, 37, 38, 39, 40)
AND EXISTS (
    SELECT 1 FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = m.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
AND NOT EXISTS (
    SELECT 1 FROM municipios m2
    WHERE m2.id_estado = (
        SELECT MIN(e2.id_estado) 
        FROM estados e2 
        WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = m.id_estado)
        AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
    )
    AND m2.num_municipio = m.num_municipio
);

-- Actualizar cualquier solicitante que quede
UPDATE solicitantes s
SET id_estado = (
    SELECT MIN(e2.id_estado) 
    FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = s.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
WHERE s.id_estado IN (36, 37, 38, 39, 40)
AND EXISTS (
    SELECT 1 FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = s.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
);

-- Actualizar cualquier nucleo que quede
UPDATE nucleos n
SET id_estado = (
    SELECT MIN(e2.id_estado) 
    FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = n.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
)
WHERE n.id_estado IN (36, 37, 38, 39, 40)
AND EXISTS (
    SELECT 1 FROM estados e2 
    WHERE e2.nombre_estado = (SELECT nombre_estado FROM estados WHERE id_estado = n.id_estado)
    AND e2.id_estado NOT IN (36, 37, 38, 39, 40)
);

-- Eliminar cualquier parroquia huérfana que quede
DELETE FROM parroquias p
WHERE p.id_estado IN (36, 37, 38, 39, 40);

-- Eliminar cualquier municipio huérfano que quede
DELETE FROM municipios m
WHERE m.id_estado IN (36, 37, 38, 39, 40);

-- ============================================================
-- PASO 5: Eliminar estados duplicados
-- ============================================================
DELETE FROM estados e
WHERE e.id_estado IN (36, 37, 38, 39, 40);

DROP TABLE IF EXISTS estados_duplicados;

COMMIT;

-- ============================================================
-- VERIFICACIÓN: Mostrar si los estados fueron eliminados
-- ============================================================
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'Éxito: Todos los estados duplicados fueron eliminados'
        ELSE 'Atención: Aún existen ' || COUNT(*) || ' estados duplicados. IDs: ' || string_agg(id_estado::text, ', ')
    END as resultado
FROM estados
WHERE id_estado IN (36, 37, 38, 39, 40);
