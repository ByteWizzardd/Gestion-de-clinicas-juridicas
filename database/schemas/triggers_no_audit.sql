-- =========================================================
-- FUNCIONES
-- =========================================================

-- Función: assign_nombre_usuario_from_email
CREATE OR REPLACE FUNCTION public.assign_nombre_usuario_from_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ 
DECLARE 
    nombre_usuario_extracted VARCHAR(100); 
BEGIN 
    IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN 
        RETURN NEW; 
    END IF; 

    IF NEW.correo_electronico IS NULL OR NEW.correo_electronico = '' THEN 
        RAISE EXCEPTION 'No se puede asignar nombre_usuario: el usuario con cédula % no tiene correo electrónico', NEW.cedula; 
    END IF; 

    nombre_usuario_extracted := SPLIT_PART(NEW.correo_electronico, '@', 1); 

    IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN 
        RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', NEW.correo_electronico; 
    END IF; 

    NEW.nombre_usuario := nombre_usuario_extracted; 
    RETURN NEW; 
END; 
$function$
;

-- Función: trigger_crear_cambio_estatus_inicial
CREATE OR REPLACE FUNCTION public.trigger_crear_cambio_estatus_inicial()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    num_cambio_actual INTEGER;
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de insertar el caso
    BEGIN
        cedula_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso. Error: %', SQLERRM;
    END;
    
    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso (variable vacía)';
    END IF;
    
    -- Calcular el num_cambio (será 1 para el primer cambio)
    SELECT COALESCE(MAX(num_cambio), 0) + 1 INTO num_cambio_actual
    FROM cambio_estatus
    WHERE id_caso = NEW.id_caso;
    
    -- Insertar el cambio de estatus inicial con estatus 'Asesoría'
    INSERT INTO cambio_estatus (
        num_cambio,
        id_caso,
        nuevo_estatus,
        id_usuario_cambia,
        motivo
    ) VALUES (
        num_cambio_actual,
        NEW.id_caso,
        'Asesoría',
        cedula_usuario,
        'Registro del caso'
    );
    
    RETURN NEW;
END;
$function$
;

-- Tabla: usuarios
DROP TRIGGER IF EXISTS trigger_assign_nombre_usuario ON usuarios;
CREATE TRIGGER trigger_assign_nombre_usuario BEFORE INSERT OR UPDATE ON public.usuarios FOR EACH ROW WHEN (((new.nombre_usuario IS NULL) OR ((new.nombre_usuario)::text = ''::text))) EXECUTE FUNCTION assign_nombre_usuario_from_email();

-- Tabla: casos
DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;
CREATE TRIGGER trigger_crear_cambio_estatus_inicial AFTER INSERT ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();
