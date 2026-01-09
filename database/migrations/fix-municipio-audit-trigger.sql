-- Add columns for PK tracking in municipio updates if not exist (idempotent)
DO $$
BEGIN
    BEGIN
        ALTER TABLE auditoria_actualizacion_municipios ADD COLUMN id_estado_anterior INTEGER;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
    BEGIN
        ALTER TABLE auditoria_actualizacion_municipios ADD COLUMN num_municipio_anterior INTEGER;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- Update the trigger function REPLACING 'SISTEMA' with NULL logic
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_municipio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    -- Treat empty string as NULL (common in some web app contexts)
    IF v_usuario = '' THEN
        v_usuario := NULL;
    END IF;
    
    -- Check for changes
    IF OLD.nombre_municipio IS DISTINCT FROM NEW.nombre_municipio OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_estado IS DISTINCT FROM NEW.id_estado OR
       OLD.num_municipio IS DISTINCT FROM NEW.num_municipio THEN
       
        -- If State (FK) changed, log as an Insertion (Creation) in the new state context
        IF OLD.id_estado IS DISTINCT FROM NEW.id_estado THEN
            BEGIN
                INSERT INTO auditoria_insercion_municipios (
                    id_estado, num_municipio, nombre_municipio, habilitado, id_usuario_creo
                ) VALUES (
                    NEW.id_estado, NEW.num_municipio, NEW.nombre_municipio, NEW.habilitado, v_usuario
                );
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END;
        END IF;

        -- Log update details
        BEGIN
            INSERT INTO auditoria_actualizacion_municipios (
                id_estado, num_municipio, 
                nombre_municipio_anterior, nombre_municipio_nuevo,
                habilitado_anterior, habilitado_nuevo, 
                id_estado_anterior, num_municipio_anterior,
                id_usuario_actualizo
            ) VALUES (
                NEW.id_estado, NEW.num_municipio, 
                OLD.nombre_municipio, NEW.nombre_municipio,
                OLD.habilitado, NEW.habilitado, 
                OLD.id_estado, OLD.num_municipio,
                v_usuario
            );
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
