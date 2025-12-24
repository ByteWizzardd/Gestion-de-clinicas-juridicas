-- Migración: Agregar campo nombre_ambito_legal a ambitos_legales
-- Descripción: Agrega el campo nombre_ambito_legal que faltaba en la tabla ambitos_legales

-- Limpiar cualquier transacción abortada previa
ROLLBACK;

BEGIN;

-- Agregar el campo si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ambitos_legales' 
        AND column_name = 'nombre_ambito_legal'
    ) THEN
        ALTER TABLE ambitos_legales 
        ADD COLUMN nombre_ambito_legal VARCHAR(200) NOT NULL DEFAULT 'Sin nombre';
        
        -- Si hay datos existentes, actualizar con un valor por defecto
        UPDATE ambitos_legales 
        SET nombre_ambito_legal = 'Ámbito Legal ' || num_ambito_legal::text
        WHERE nombre_ambito_legal = 'Sin nombre';
        
        RAISE NOTICE 'Campo nombre_ambito_legal agregado exitosamente';
    ELSE
        RAISE NOTICE 'El campo nombre_ambito_legal ya existe';
    END IF;
END $$;

COMMIT;

