-- Agregar columnas para fotos de perfil en auditoría de actualización de usuarios
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auditoria_actualizacion_usuarios' AND column_name = 'foto_perfil_anterior') THEN
        ALTER TABLE auditoria_actualizacion_usuarios ADD COLUMN foto_perfil_anterior VARCHAR(500);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'auditoria_actualizacion_usuarios' AND column_name = 'foto_perfil_nuevo') THEN
        ALTER TABLE auditoria_actualizacion_usuarios ADD COLUMN foto_perfil_nuevo VARCHAR(500);
    END IF;
END $$;

-- Actualizar la función del trigger para capturar cambios en foto_perfil
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_actualiza_usuario', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
    END;
    
    -- Registrar la auditoría solo si hay cambios reales y hay usuario
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        -- Registrar si hubo cambios en cualquier campo (incluyendo foto_perfil y tipo_usuario)
        IF (OLD.nombres IS DISTINCT FROM NEW.nombres) OR
           (OLD.apellidos IS DISTINCT FROM NEW.apellidos) OR
           (OLD.correo_electronico IS DISTINCT FROM NEW.correo_electronico) OR
           (OLD.nombre_usuario IS DISTINCT FROM NEW.nombre_usuario) OR
           (OLD.telefono_celular IS DISTINCT FROM NEW.telefono_celular) OR
           (OLD.habilitado_sistema IS DISTINCT FROM NEW.habilitado_sistema) OR
           (OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario) OR
           (OLD.foto_perfil IS DISTINCT FROM NEW.foto_perfil) THEN
            
            INSERT INTO auditoria_actualizacion_usuarios (
                ci_usuario,
                nombres_anterior,
                apellidos_anterior,
                correo_electronico_anterior,
                nombre_usuario_anterior,
                telefono_celular_anterior,
                habilitado_sistema_anterior,
                tipo_usuario_anterior,
                foto_perfil_anterior,
                nombres_nuevo,
                apellidos_nuevo,
                correo_electronico_nuevo,
                nombre_usuario_nuevo,
                telefono_celular_nuevo,
                habilitado_sistema_nuevo,
                tipo_usuario_nuevo,
                foto_perfil_nuevo,
                id_usuario_actualizo,
                fecha_actualizacion
            ) VALUES (
                NEW.cedula,
                OLD.nombres,
                OLD.apellidos,
                OLD.correo_electronico,
                OLD.nombre_usuario,
                OLD.telefono_celular,
                OLD.habilitado_sistema,
                OLD.tipo_usuario,
                OLD.foto_perfil,
                NEW.nombres,
                NEW.apellidos,
                NEW.correo_electronico,
                NEW.nombre_usuario,
                NEW.telefono_celular,
                NEW.habilitado_sistema,
                NEW.tipo_usuario,
                NEW.foto_perfil,
                cedula_usuario,
                (NOW() AT TIME ZONE 'America/Caracas')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;
