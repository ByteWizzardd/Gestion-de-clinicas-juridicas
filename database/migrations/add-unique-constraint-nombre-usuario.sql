-- Migración: Agregar restricción UNIQUE a nombre_usuario
-- Fecha: 2025-01-XX
-- Descripción: Establece nombre_usuario como clave alternativa (alternate key) única

-- Verificar si ya existe la restricción UNIQUE antes de agregarla
DO $$
BEGIN
    -- Intentar agregar la restricción UNIQUE si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'usuarios_nombre_usuario_key' 
        AND conrelid = 'usuarios'::regclass
    ) THEN
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);
    END IF;
END $$;

-- Verificar que no haya duplicados antes de aplicar la restricción
DO $$
DECLARE
    usuarios_duplicados INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuarios_duplicados
    FROM (
        SELECT nombre_usuario, COUNT(*) as cnt
        FROM usuarios
        WHERE nombre_usuario IS NOT NULL
        GROUP BY nombre_usuario
        HAVING COUNT(*) > 1
    ) duplicados;
    
    IF usuarios_duplicados > 0 THEN
        RAISE EXCEPTION 'Existen usuarios con nombre_usuario duplicado. Por favor, corrige los duplicados antes de aplicar la restricción UNIQUE.';
    END IF;
END $$;

