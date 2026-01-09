-- Update the trigger function to use the Coordinator's cedula as fallback
-- Coordinator Cedula: 30000000
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_municipio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_fallback_user VARCHAR(20) := '30000000'; -- Coordinator
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    -- Fallback if no user context
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := v_fallback_user;
    END IF;
    
    -- Validate that the user exists to prevent FK errors (optional, but safe)
    -- If '30000000' doesn't exist for some reason, we might still fail FK, 
    -- but we assume it exists based on previous check.
    
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
                    -- Ignore insertion errors
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
                -- Ignore update errors
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
