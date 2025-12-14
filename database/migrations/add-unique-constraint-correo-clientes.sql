-- Migración: Agregar restricción UNIQUE a correo_electronico en clientes
-- Fecha: 2025-01-XX
-- Descripción: Establece correo_electronico como clave alternativa (alternate key) única

-- Paso 1: Limpiar correos duplicados o inválidos
-- Para cada correo duplicado, mantener solo el primero (por cédula) y actualizar los demás
DO $$
DECLARE
    correo_duplicado RECORD;
    contador INTEGER := 1;
BEGIN
    -- Iterar sobre correos duplicados
    FOR correo_duplicado IN 
        SELECT correo_electronico, COUNT(*) as cnt
        FROM clientes
        WHERE correo_electronico IS NOT NULL 
          AND correo_electronico != ''
          AND correo_electronico NOT LIKE '@%' -- Excluir correos que empiezan con @
        GROUP BY correo_electronico
        HAVING COUNT(*) > 1
    LOOP
        -- Para cada correo duplicado, mantener el primero y actualizar los demás
        -- Actualizar los duplicados con un sufijo único basado en la cédula
        UPDATE clientes
        SET correo_electronico = correo_duplicado.correo_electronico || '.' || cedula || '@temp.duplicado'
        WHERE correo_electronico = correo_duplicado.correo_electronico
          AND cedula NOT IN (
              SELECT cedula 
              FROM clientes 
              WHERE correo_electronico = correo_duplicado.correo_electronico 
              ORDER BY cedula 
              LIMIT 1
          );
        
        RAISE NOTICE 'Corregidos % duplicados del correo: %', correo_duplicado.cnt - 1, correo_duplicado.correo_electronico;
    END LOOP;
    
    -- Limpiar correos inválidos (que empiezan con @ o están vacíos)
    UPDATE clientes
    SET correo_electronico = 'sin-correo-' || cedula || '@temp.invalido'
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
        FROM clientes
        WHERE correo_electronico IS NOT NULL
        GROUP BY correo_electronico
        HAVING COUNT(*) > 1
    ) duplicados;
    
    IF correos_duplicados > 0 THEN
        RAISE EXCEPTION 'Aún existen % correo(s) duplicado(s) después de la limpieza. Por favor, revisa y corrige manualmente antes de aplicar la restricción UNIQUE.', correos_duplicados;
    END IF;
END $$;

-- Paso 3: Agregar la restricción UNIQUE
DO $$
BEGIN
    -- Intentar agregar la restricción UNIQUE si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'clientes_correo_electronico_key' 
        AND conrelid = 'clientes'::regclass
    ) THEN
        ALTER TABLE clientes 
        ADD CONSTRAINT clientes_correo_electronico_key UNIQUE (correo_electronico);
        
        RAISE NOTICE 'Restricción UNIQUE agregada exitosamente a correo_electronico';
    ELSE
        RAISE NOTICE 'La restricción UNIQUE ya existe en correo_electronico';
    END IF;
END $$;

