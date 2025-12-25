-- ==========================================================
-- MIGRACIÓN: Agregar restricción UNIQUE a correo_electronico en solicitantes
-- ==========================================================
-- Descripción: Establece correo_electronico como único para evitar que
--              múltiples solicitantes compartan el mismo correo electrónico
-- ==========================================================

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

-- Iniciar nueva transacción
BEGIN;

-- Paso 1: Limpiar correos duplicados o inválidos
-- Para cada correo duplicado, mantener solo el primero (por cédula) y actualizar los demás
DO $$
DECLARE
    correo_duplicado RECORD;
BEGIN
    -- Iterar sobre correos duplicados
    FOR correo_duplicado IN 
        SELECT correo_electronico, COUNT(*) as cnt
        FROM solicitantes
        WHERE correo_electronico IS NOT NULL 
          AND correo_electronico != ''
          AND correo_electronico NOT LIKE '@%' -- Excluir correos que empiezan con @
        GROUP BY correo_electronico
        HAVING COUNT(*) > 1
    LOOP
        -- Para cada correo duplicado, mantener el primero y actualizar los demás
        -- Actualizar los duplicados con un sufijo único basado en la cédula
        UPDATE solicitantes
        SET correo_electronico = correo_duplicado.correo_electronico || '.' || REPLACE(cedula, '-', '') || '@temp.duplicado'
        WHERE correo_electronico = correo_duplicado.correo_electronico
          AND cedula NOT IN (
              SELECT cedula 
              FROM solicitantes 
              WHERE correo_electronico = correo_duplicado.correo_electronico 
              ORDER BY cedula 
              LIMIT 1
          );
        
        RAISE NOTICE 'Corregidos % duplicados del correo: %', correo_duplicado.cnt - 1, correo_duplicado.correo_electronico;
    END LOOP;
    
    -- Limpiar correos inválidos (que empiezan con @ o están vacíos)
    UPDATE solicitantes
    SET correo_electronico = 'sin-correo-' || REPLACE(cedula, '-', '') || '@temp.invalido'
    WHERE correo_electronico IS NULL 
       OR correo_electronico = ''
       OR correo_electronico LIKE '@%';
    
    RAISE NOTICE 'Correos inválidos actualizados';
END $$;

-- Paso 2: Verificar que no queden duplicados
DO $$
DECLARE
    correos_duplicados INTEGER;
BEGIN
    SELECT COUNT(*) INTO correos_duplicados
    FROM (
        SELECT correo_electronico, COUNT(*) as cnt
        FROM solicitantes
        WHERE correo_electronico IS NOT NULL 
          AND correo_electronico != ''
        GROUP BY correo_electronico
        HAVING COUNT(*) > 1
    ) AS duplicados;
    
    IF correos_duplicados > 0 THEN
        RAISE EXCEPTION 'Aún existen % correos duplicados. Por favor, corríjalos manualmente antes de ejecutar esta migración.', correos_duplicados;
    END IF;
    
    RAISE NOTICE 'No se encontraron correos duplicados. Procediendo a agregar la restricción UNIQUE...';
END $$;

-- Paso 3: Agregar la restricción UNIQUE
ALTER TABLE solicitantes
ADD CONSTRAINT solicitantes_correo_electronico_unique UNIQUE (correo_electronico);

-- Finalizar transacción
COMMIT;

