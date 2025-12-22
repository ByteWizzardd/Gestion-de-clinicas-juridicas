-- Migración: Migrar datos de citas a atienden y modificar tabla citas
-- Descripción: Migra fecha_registro e id_usuario_orientacion de citas a atienden,
-- luego elimina esas columnas de citas
-- IMPORTANTE: Esta migración debe ejecutarse DESPUÉS de create-atienden-table.sql

-- Paso 1: Verificar que la tabla atienden existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'atienden'
    ) THEN
        RAISE EXCEPTION 'La tabla atienden no existe. Ejecuta primero create-atienden-table.sql';
    END IF;
END $$;

-- Paso 2: Migrar los datos existentes de citas a atienden
-- Solo si hay datos en citas que no estén en atienden
DO $$
BEGIN
    -- Verificar si la columna id_usuario_orientacion existe en citas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'citas' AND column_name = 'id_usuario_orientacion'
    ) THEN
        -- Insertar los datos existentes solo si no existen ya en atienden
        INSERT INTO atienden (id_usuario, num_cita, id_caso, fecha_registro)
        SELECT 
            c.id_usuario_orientacion,
            c.num_cita,
            c.id_caso,
            COALESCE(c.fecha_registro, CURRENT_DATE)
        FROM citas c
        WHERE NOT EXISTS (
            SELECT 1 FROM atienden a
            WHERE a.num_cita = c.num_cita 
            AND a.id_caso = c.id_caso
            AND a.id_usuario = c.id_usuario_orientacion
        )
        AND c.id_usuario_orientacion IS NOT NULL;
    END IF;
END $$;

-- Paso 3: Eliminar las columnas de citas que ahora están en atienden
DO $$
BEGIN
    -- Eliminar id_usuario_orientacion si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'citas' AND column_name = 'id_usuario_orientacion'
    ) THEN
        ALTER TABLE citas DROP COLUMN id_usuario_orientacion;
    END IF;
    
    -- Eliminar fecha_registro si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'citas' AND column_name = 'fecha_registro'
    ) THEN
        ALTER TABLE citas DROP COLUMN fecha_registro;
    END IF;
END $$;

