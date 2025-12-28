-- Eliminar el campo id_usuario_registra de la tabla casos
-- Este campo ya no es necesario porque el usuario que registra el caso
-- se obtiene del primer cambio_estatus (trigger automático)

DO $$
BEGIN
    -- Verificar si la columna existe antes de eliminarla
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'casos' 
        AND column_name = 'id_usuario_registra'
    ) THEN
        ALTER TABLE casos 
        DROP COLUMN id_usuario_registra;
        
        RAISE NOTICE 'Columna id_usuario_registra eliminada de la tabla casos';
    ELSE
        RAISE NOTICE 'La columna id_usuario_registra no existe en la tabla casos';
    END IF;
END $$;

