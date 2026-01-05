-- Migración: Agregar campo habilitado a niveles_educativos
-- Descripción: Agrega el campo habilitado para permitir deshabilitar niveles educativos sin eliminarlos

-- Agregar la columna habilitado si no existe (idempotente)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'niveles_educativos' AND column_name = 'habilitado'
    ) THEN
        ALTER TABLE niveles_educativos 
        ADD COLUMN habilitado BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;
