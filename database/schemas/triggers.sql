
-- =========================================================
-- FUNCIONES
-- =========================================================

-- Función: assign_nombre_usuario_from_email
CREATE OR REPLACE FUNCTION public.assign_nombre_usuario_from_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE nombre_usuario_extracted VARCHAR(100); BEGIN IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN RETURN NEW; END IF; IF NEW.correo_electronico IS NULL OR NEW.correo_electronico = '' THEN RAISE EXCEPTION 'No se puede asignar nombre_usuario: el usuario con cédula % no tiene correo electrónico', NEW.cedula; END IF; nombre_usuario_extracted := SPLIT_PART(NEW.correo_electronico, '@', 1); IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', NEW.correo_electronico; END IF; NEW.nombre_usuario := nombre_usuario_extracted; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_accion
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF (OLD.detalle_accion IS DISTINCT FROM NEW.detalle_accion OR
        OLD.comentario IS DISTINCT FROM NEW.comentario OR
        OLD.id_usuario_registra IS DISTINCT FROM NEW.id_usuario_registra OR
        OLD.fecha_registro IS DISTINCT FROM NEW.fecha_registro) THEN
        
        INSERT INTO auditoria_actualizacion_acciones (
            num_accion,
            id_caso,
            detalle_accion_anterior, detalle_accion_nuevo,
            comentario_anterior, comentario_nuevo,
            id_usuario_registra_anterior, id_usuario_registra_nuevo,
            fecha_registro_anterior, fecha_registro_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_accion,
            NEW.id_caso,
            OLD.detalle_accion, NEW.detalle_accion,
            OLD.comentario, NEW.comentario,
            OLD.id_usuario_registra, NEW.id_usuario_registra,
            OLD.fecha_registro, NEW.fecha_registro,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_ambito_legal
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_ambito_legal()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_ambito_legal IS DISTINCT FROM NEW.nombre_ambito_legal OR OLD.habilitado IS DISTINCT FROM NEW.habilitado OR OLD.id_materia IS DISTINCT FROM NEW.id_materia OR OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria OR OLD.num_ambito_legal IS DISTINCT FROM NEW.num_ambito_legal THEN INSERT INTO auditoria_actualizacion_ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal_anterior, nombre_ambito_legal_nuevo, habilitado_anterior, habilitado_nuevo, id_materia_anterior, id_materia_nuevo, num_categoria_anterior, num_categoria_nuevo, num_subcategoria_anterior, num_subcategoria_nuevo, num_ambito_legal_anterior, num_ambito_legal_nuevo, id_usuario_actualizo) VALUES (NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.num_ambito_legal, OLD.nombre_ambito_legal, NEW.nombre_ambito_legal, OLD.habilitado, NEW.habilitado, OLD.id_materia, NEW.id_materia, OLD.num_categoria, NEW.num_categoria, OLD.num_subcategoria, NEW.num_subcategoria, OLD.num_ambito_legal, NEW.num_ambito_legal, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_beneficiario
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    IF (OLD.cedula IS DISTINCT FROM NEW.cedula) OR
       (OLD.nombres IS DISTINCT FROM NEW.nombres) OR
       (OLD.apellidos IS DISTINCT FROM NEW.apellidos) OR
       (OLD.fecha_nac IS DISTINCT FROM NEW.fecha_nac) OR
       (OLD.sexo IS DISTINCT FROM NEW.sexo) OR
       (OLD.tipo_beneficiario IS DISTINCT FROM NEW.tipo_beneficiario) OR
       (OLD.parentesco IS DISTINCT FROM NEW.parentesco) THEN
       
        INSERT INTO auditoria_actualizacion_beneficiarios (
            num_beneficiario, id_caso,
            cedula_anterior, nombres_anterior, apellidos_anterior, fecha_nacimiento_anterior, sexo_anterior, tipo_beneficiario_anterior, parentesco_anterior,
            cedula_nuevo, nombres_nuevo, apellidos_nuevo, fecha_nacimiento_nuevo, sexo_nuevo, tipo_beneficiario_nuevo, parentesco_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_beneficiario, NEW.id_caso,
            OLD.cedula, OLD.nombres, OLD.apellidos, OLD.fecha_nac, OLD.sexo, OLD.tipo_beneficiario, OLD.parentesco,
            NEW.cedula, NEW.nombres, NEW.apellidos, NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.descripcion IS DISTINCT FROM NEW.descripcion OR OLD.habilitado IS DISTINCT FROM NEW.habilitado OR OLD.id_tipo_caracteristica IS DISTINCT FROM NEW.id_tipo_caracteristica OR OLD.num_caracteristica IS DISTINCT FROM NEW.num_caracteristica THEN INSERT INTO auditoria_actualizacion_caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion_anterior, descripcion_nuevo, habilitado_anterior, habilitado_nuevo, id_tipo_caracteristica_anterior, id_tipo_caracteristica_nuevo, num_caracteristica_anterior, num_caracteristica_nuevo, id_usuario_actualizo) VALUES (NEW.id_tipo_caracteristica, NEW.num_caracteristica, OLD.descripcion, NEW.descripcion, OLD.habilitado, NEW.habilitado, OLD.id_tipo_caracteristica, NEW.id_tipo_caracteristica, OLD.num_caracteristica, NEW.num_caracteristica, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_caso
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN BEGIN v_usuario := current_setting('app.usuario_actualiza_caso', true); EXCEPTION WHEN OTHERS THEN v_usuario := NULL; END; IF (OLD.fecha_solicitud IS DISTINCT FROM NEW.fecha_solicitud OR OLD.fecha_inicio_caso IS DISTINCT FROM NEW.fecha_inicio_caso OR OLD.fecha_fin_caso IS DISTINCT FROM NEW.fecha_fin_caso OR OLD.tramite IS DISTINCT FROM NEW.tramite OR OLD.observaciones IS DISTINCT FROM NEW.observaciones OR OLD.id_nucleo IS DISTINCT FROM NEW.id_nucleo OR OLD.cedula IS DISTINCT FROM NEW.cedula OR OLD.id_materia IS DISTINCT FROM NEW.id_materia OR OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria OR OLD.num_ambito_legal IS DISTINCT FROM NEW.num_ambito_legal) THEN INSERT INTO auditoria_actualizacion_casos (id_caso, fecha_solicitud_anterior, fecha_solicitud_nuevo, fecha_inicio_caso_anterior, fecha_inicio_caso_nuevo, fecha_fin_caso_anterior, fecha_fin_caso_nuevo, tramite_anterior, tramite_nuevo, observaciones_anterior, observaciones_nuevo, id_nucleo_anterior, id_nucleo_nuevo, cedula_solicitante_anterior, cedula_solicitante_nuevo, id_materia_anterior, id_materia_nuevo, num_categoria_anterior, num_categoria_nuevo, num_subcategoria_anterior, num_subcategoria_nuevo, num_ambito_legal_anterior, num_ambito_legal_nuevo, id_usuario_actualizo) VALUES (NEW.id_caso, OLD.fecha_solicitud, NEW.fecha_solicitud, OLD.fecha_inicio_caso, NEW.fecha_inicio_caso, OLD.fecha_fin_caso, NEW.fecha_fin_caso, OLD.tramite, NEW.tramite, OLD.observaciones, NEW.observaciones, OLD.id_nucleo, NEW.id_nucleo, OLD.cedula, NEW.cedula, OLD.id_materia, NEW.id_materia, OLD.num_categoria, NEW.num_categoria, OLD.num_subcategoria, NEW.num_subcategoria, OLD.num_ambito_legal, NEW.num_ambito_legal, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_categoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_categoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_categoria IS DISTINCT FROM NEW.nombre_categoria OR OLD.habilitado IS DISTINCT FROM NEW.habilitado OR OLD.id_materia IS DISTINCT FROM NEW.id_materia OR OLD.num_categoria IS DISTINCT FROM NEW.num_categoria THEN INSERT INTO auditoria_actualizacion_categorias (id_materia, num_categoria, nombre_categoria_anterior, nombre_categoria_nuevo, habilitado_anterior, habilitado_nuevo, id_materia_anterior, id_materia_nuevo, num_categoria_anterior, num_categoria_nuevo, id_usuario_actualizo) VALUES (NEW.id_materia, NEW.num_categoria, OLD.nombre_categoria, NEW.nombre_categoria, OLD.habilitado, NEW.habilitado, OLD.id_materia, NEW.id_materia, OLD.num_categoria, NEW.num_categoria, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_cita
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
    skip_audit TEXT;
BEGIN
    BEGIN
        -- Permitir saltar la auditoría si la aplicación lo solicita
        skip_audit := current_setting('app.skip_audit_trigger', true);
        IF skip_audit = 'true' THEN
            RETURN NEW;
        END IF;

        -- Intentar obtener de app.usuario_actualiza_cita primero (usado por la actualización de citas)
        cedula_usuario := current_setting('app.usuario_actualiza_cita', true);
        -- Si está vacío, intentar con app.current_user_id
        IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
            cedula_usuario := current_setting('app.current_user_id', true);
        END IF;
    EXCEPTION WHEN OTHERS THEN
        cedula_usuario := NULL;
    END;
    
    IF OLD.fecha_encuentro IS DISTINCT FROM NEW.fecha_encuentro OR
       OLD.fecha_proxima_cita IS DISTINCT FROM NEW.fecha_proxima_cita OR
       OLD.orientacion IS DISTINCT FROM NEW.orientacion THEN
       
        INSERT INTO auditoria_actualizacion_citas (
            num_cita,
            id_caso,
            fecha_encuentro_anterior,
            fecha_proxima_cita_anterior,
            orientacion_anterior,
            fecha_encuentro_nuevo,
            fecha_proxima_cita_nuevo,
            orientacion_nuevo,
            id_usuario_actualizo,
            fecha_actualizacion
        ) VALUES (
            NEW.num_cita,
            NEW.id_caso,
            OLD.fecha_encuentro,
            OLD.fecha_proxima_cita,
            OLD.orientacion,
            NEW.fecha_encuentro,
            NEW.fecha_proxima_cita,
            NEW.orientacion,
            cedula_usuario,
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_condicion_actividad
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_condicion_actividad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_actividad IS DISTINCT FROM NEW.nombre_actividad OR OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN INSERT INTO auditoria_actualizacion_condiciones_actividad (id_actividad, nombre_actividad_anterior, nombre_actividad_nuevo, habilitado_anterior, habilitado_nuevo, id_usuario_actualizo) VALUES (NEW.id_actividad, OLD.nombre_actividad, NEW.nombre_actividad, OLD.habilitado, NEW.habilitado, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_condicion_trabajo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_condicion_trabajo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_trabajo IS DISTINCT FROM NEW.nombre_trabajo OR OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN INSERT INTO auditoria_actualizacion_condiciones_trabajo (id_trabajo, nombre_trabajo_anterior, nombre_trabajo_nuevo, habilitado_anterior, habilitado_nuevo, id_usuario_actualizo) VALUES (NEW.id_trabajo, OLD.nombre_trabajo, NEW.nombre_trabajo, OLD.habilitado, NEW.habilitado, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_estado
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_estado()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    IF OLD.nombre_estado IS DISTINCT FROM NEW.nombre_estado OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_estados (
                id_estado, nombre_estado_anterior, nombre_estado_nuevo,
                habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
            ) VALUES (
                NEW.id_estado, OLD.nombre_estado, NEW.nombre_estado,
                OLD.habilitado, NEW.habilitado, v_usuario
            );
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_familia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_familia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_solicitante RECORD;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
BEGIN
    -- Verificar si estamos en modo de creación (ignorar actualizaciones durante la creación)
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    -- Si estamos en modo creación, NO registrar como actualización
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        RETURN NEW;
    END IF;

    -- Obtener el usuario
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si hay cambio real en cualquier campo
    IF OLD.cant_personas IS DISTINCT FROM NEW.cant_personas OR
       OLD.cant_trabajadores IS DISTINCT FROM NEW.cant_trabajadores OR
       OLD.cant_no_trabajadores IS DISTINCT FROM NEW.cant_no_trabajadores OR
       OLD.cant_ninos IS DISTINCT FROM NEW.cant_ninos OR
       OLD.cant_ninos_estudiando IS DISTINCT FROM NEW.cant_ninos_estudiando OR
       OLD.jefe_hogar IS DISTINCT FROM NEW.jefe_hogar OR
       OLD.ingresos_mensuales IS DISTINCT FROM NEW.ingresos_mensuales OR
       OLD.id_nivel_educativo_jefe IS DISTINCT FROM NEW.id_nivel_educativo_jefe THEN
       
        -- Obtener datos del solicitante
        SELECT * INTO v_solicitante FROM solicitantes WHERE cedula = NEW.cedula_solicitante;
        
        -- Obtener nivel educativo jefe anterior
        SELECT descripcion INTO v_nivel_edu_jefe_ant
        FROM niveles_educativos WHERE id_nivel_educativo = OLD.id_nivel_educativo_jefe;
        
        -- Obtener nivel educativo jefe nuevo
        SELECT descripcion INTO v_nivel_edu_jefe_nue
        FROM niveles_educativos WHERE id_nivel_educativo = NEW.id_nivel_educativo_jefe;
        
        -- Insertar auditoría
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            sexo_anterior, sexo_nuevo,
            cant_personas_anterior, cant_personas_nuevo,
            cant_trabajadores_anterior, cant_trabajadores_nuevo,
            cant_no_trabajadores_anterior, cant_no_trabajadores_nuevo,
            cant_ninos_anterior, cant_ninos_nuevo,
            cant_ninos_estudiando_anterior, cant_ninos_estudiando_nuevo,
            jefe_hogar_anterior, jefe_hogar_nuevo,
            nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
            ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.cedula_solicitante,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.sexo, v_solicitante.sexo,
            OLD.cant_personas, NEW.cant_personas,
            OLD.cant_trabajadores, NEW.cant_trabajadores,
            OLD.cant_no_trabajadores, NEW.cant_no_trabajadores,
            OLD.cant_ninos, NEW.cant_ninos,
            OLD.cant_ninos_estudiando, NEW.cant_ninos_estudiando,
            OLD.jefe_hogar, NEW.jefe_hogar,
            v_nivel_edu_jefe_ant, v_nivel_edu_jefe_nue,
            OLD.ingresos_mensuales, NEW.ingresos_mensuales,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_materia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_materia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    IF OLD.nombre_materia IS DISTINCT FROM NEW.nombre_materia OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_materias (
                id_materia, nombre_materia_anterior, nombre_materia_nuevo,
                habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
            ) VALUES (
                NEW.id_materia, OLD.nombre_materia, NEW.nombre_materia,
                OLD.habilitado, NEW.habilitado, v_usuario
            );
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_municipio
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_municipio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);

BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
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
$function$
;

-- Función: trigger_auditoria_actualizacion_nivel_educativo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_nivel_educativo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.descripcion IS DISTINCT FROM NEW.descripcion OR OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN INSERT INTO auditoria_actualizacion_niveles_educativos (id_nivel_educativo, descripcion_anterior, descripcion_nuevo, habilitado_anterior, habilitado_nuevo, id_usuario_actualizo) VALUES (NEW.id_nivel_educativo, OLD.descripcion, NEW.descripcion, OLD.habilitado, NEW.habilitado, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_nucleo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_nucleo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_nucleo IS DISTINCT FROM NEW.nombre_nucleo OR OLD.habilitado IS DISTINCT FROM NEW.habilitado OR OLD.id_estado IS DISTINCT FROM NEW.id_estado OR OLD.num_municipio IS DISTINCT FROM NEW.num_municipio OR OLD.num_parroquia IS DISTINCT FROM NEW.num_parroquia THEN INSERT INTO auditoria_actualizacion_nucleos (id_nucleo, nombre_nucleo_anterior, nombre_nucleo_nuevo, habilitado_anterior, habilitado_nuevo, id_estado_anterior, id_estado_nuevo, num_municipio_anterior, num_municipio_nuevo, num_parroquia_anterior, num_parroquia_nuevo, id_usuario_actualizo) VALUES (NEW.id_nucleo, OLD.nombre_nucleo, NEW.nombre_nucleo, OLD.habilitado, NEW.habilitado, OLD.id_estado, NEW.id_estado, OLD.num_municipio, NEW.num_municipio, OLD.num_parroquia, NEW.num_parroquia, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_parroquia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_parroquia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    IF OLD.nombre_parroquia IS DISTINCT FROM NEW.nombre_parroquia OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_estado IS DISTINCT FROM NEW.id_estado OR
       OLD.num_municipio IS DISTINCT FROM NEW.num_municipio THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_parroquias (
            id_estado, num_municipio, num_parroquia, nombre_parroquia_anterior, nombre_parroquia_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_estado_anterior, id_estado_nuevo,
            num_municipio_anterior, num_municipio_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_estado, NEW.num_municipio, NEW.num_parroquia, OLD.nombre_parroquia, NEW.nombre_parroquia,
            OLD.habilitado, NEW.habilitado,
            OLD.id_estado, NEW.id_estado,
            OLD.num_municipio, NEW.num_municipio,
            v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_semestre
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_semestre()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_usuario VARCHAR(20); 
BEGIN 
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN v_usuario := NULL;
    END;

    IF OLD.fecha_inicio IS DISTINCT FROM NEW.fecha_inicio OR 
       OLD.fecha_fin IS DISTINCT FROM NEW.fecha_fin OR 
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.term IS DISTINCT FROM NEW.term THEN 
       
       INSERT INTO auditoria_actualizacion_semestres (
           term, term_anterior, 
           fecha_inicio_anterior, fecha_inicio_nuevo, 
           fecha_fin_anterior, fecha_fin_nuevo, 
           habilitado_anterior, habilitado_nuevo, 
           id_usuario_actualizo
       ) VALUES (
           NEW.term, OLD.term,
           OLD.fecha_inicio, NEW.fecha_inicio, 
           OLD.fecha_fin, NEW.fecha_fin, 
           OLD.habilitado, NEW.habilitado, 
           v_usuario
       ); 
    END IF; 
    RETURN NEW; 
END; 
$function$
;

-- Función: trigger_auditoria_actualizacion_solicitante
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_solicitante()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_hay_cambio BOOLEAN := FALSE;
    v_jefe_hogar_ant BOOLEAN;
    v_jefe_hogar_nue BOOLEAN;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
    v_ingresos_ant NUMERIC;
    v_ingresos_nue NUMERIC;
BEGIN
    -- Verificar si estamos en modo de creación (ignorar actualizaciones durante la creación)
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    -- Si estamos en modo creación, NO registrar como actualización
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        RETURN NEW;
    END IF;

    -- Obtener el usuario que actualiza
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si hay cambio en la tabla solicitantes
    IF (COALESCE(OLD.cedula, '') IS DISTINCT FROM COALESCE(NEW.cedula, '') OR
        COALESCE(OLD.nombres, '') IS DISTINCT FROM COALESCE(NEW.nombres, '') OR
        COALESCE(OLD.apellidos, '') IS DISTINCT FROM COALESCE(NEW.apellidos, '') OR
        OLD.fecha_nacimiento IS DISTINCT FROM NEW.fecha_nacimiento OR
        COALESCE(OLD.telefono_local, '') IS DISTINCT FROM COALESCE(NEW.telefono_local, '') OR
        COALESCE(OLD.telefono_celular, '') IS DISTINCT FROM COALESCE(NEW.telefono_celular, '') OR
        COALESCE(OLD.correo_electronico, '') IS DISTINCT FROM COALESCE(NEW.correo_electronico, '') OR
        COALESCE(OLD.sexo, '') IS DISTINCT FROM COALESCE(NEW.sexo, '') OR
        COALESCE(OLD.nacionalidad, '') IS DISTINCT FROM COALESCE(NEW.nacionalidad, '') OR
        COALESCE(OLD.estado_civil, '') IS DISTINCT FROM COALESCE(NEW.estado_civil, '') OR
        COALESCE(OLD.concubinato, FALSE) IS DISTINCT FROM COALESCE(NEW.concubinato, FALSE) OR
        COALESCE(OLD.tipo_tiempo_estudio, '') IS DISTINCT FROM COALESCE(NEW.tipo_tiempo_estudio, '') OR
        COALESCE(OLD.tiempo_estudio, 0) IS DISTINCT FROM COALESCE(NEW.tiempo_estudio, 0) OR
        COALESCE(OLD.id_nivel_educativo, 0) IS DISTINCT FROM COALESCE(NEW.id_nivel_educativo, 0) OR
        COALESCE(OLD.id_trabajo, 0) IS DISTINCT FROM COALESCE(NEW.id_trabajo, 0) OR
        COALESCE(OLD.id_actividad, 0) IS DISTINCT FROM COALESCE(NEW.id_actividad, 0) OR
        COALESCE(OLD.id_estado, 0) IS DISTINCT FROM COALESCE(NEW.id_estado, 0) OR
        COALESCE(OLD.num_municipio, 0) IS DISTINCT FROM COALESCE(NEW.num_municipio, 0) OR
        COALESCE(OLD.num_parroquia, 0) IS DISTINCT FROM COALESCE(NEW.num_parroquia, 0)) THEN
        
        v_hay_cambio := TRUE;
    END IF;
    
    IF v_hay_cambio THEN
        -- Obtener datos de familia (ANTES)
        SELECT 
            fh.jefe_hogar,
            ne.descripcion,
            fh.ingresos_mensuales
        INTO 
            v_jefe_hogar_ant,
            v_nivel_edu_jefe_ant,
            v_ingresos_ant
        FROM familias_y_hogares fh
        LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
        WHERE fh.cedula_solicitante = OLD.cedula;
        
        -- Obtener datos de familia (DESPUÉS)
        SELECT 
            fh.jefe_hogar,
            ne.descripcion,
            fh.ingresos_mensuales
        INTO 
            v_jefe_hogar_nue,
            v_nivel_edu_jefe_nue,
            v_ingresos_nue
        FROM familias_y_hogares fh
        LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
        WHERE fh.cedula_solicitante = NEW.cedula;
        
        -- Insertar registro de auditoría (SIN artefactos)
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
            telefono_local_anterior, telefono_local_nuevo,
            telefono_celular_anterior, telefono_celular_nuevo,
            correo_electronico_anterior, correo_electronico_nuevo,
            sexo_anterior, sexo_nuevo,
            nacionalidad_anterior, nacionalidad_nuevo,
            estado_civil_anterior, estado_civil_nuevo,
            concubinato_anterior, concubinato_nuevo,
            tipo_tiempo_estudio_anterior, tipo_tiempo_estudio_nuevo,
            tiempo_estudio_anterior, tiempo_estudio_nuevo,
            id_nivel_educativo_anterior, id_nivel_educativo_nuevo,
            id_trabajo_anterior, id_trabajo_nuevo,
            id_actividad_anterior, id_actividad_nuevo,
            id_estado_anterior, id_estado_nuevo,
            num_municipio_anterior, num_municipio_nuevo,
            num_parroquia_anterior, num_parroquia_nuevo,
            jefe_hogar_anterior, jefe_hogar_nuevo,
            nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
            ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.cedula,
            OLD.nombres, NEW.nombres,
            OLD.apellidos, NEW.apellidos,
            OLD.fecha_nacimiento, NEW.fecha_nacimiento,
            OLD.telefono_local, NEW.telefono_local,
            OLD.telefono_celular, NEW.telefono_celular,
            OLD.correo_electronico, NEW.correo_electronico,
            OLD.sexo, NEW.sexo,
            OLD.nacionalidad, NEW.nacionalidad,
            OLD.estado_civil, NEW.estado_civil,
            OLD.concubinato, NEW.concubinato,
            OLD.tipo_tiempo_estudio, NEW.tipo_tiempo_estudio,
            OLD.tiempo_estudio, NEW.tiempo_estudio,
            OLD.id_nivel_educativo, NEW.id_nivel_educativo,
            OLD.id_trabajo, NEW.id_trabajo,
            OLD.id_actividad, NEW.id_actividad,
            OLD.id_estado, NEW.id_estado,
            OLD.num_municipio, NEW.num_municipio,
            OLD.num_parroquia, NEW.num_parroquia,
            v_jefe_hogar_ant, v_jefe_hogar_nue,
            v_nivel_edu_jefe_ant, v_nivel_edu_jefe_nue,
            v_ingresos_ant, v_ingresos_nue,
            v_usuario
        );
        -- NO capturamos artefactos aquí - eso lo hace el trigger en asignadas_a
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_actualizacion_subcategoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_subcategoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_subcategoria IS DISTINCT FROM NEW.nombre_subcategoria OR OLD.habilitado IS DISTINCT FROM NEW.habilitado OR OLD.id_materia IS DISTINCT FROM NEW.id_materia OR OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria THEN INSERT INTO auditoria_actualizacion_subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria_anterior, nombre_subcategoria_nuevo, habilitado_anterior, habilitado_nuevo, id_materia_anterior, id_materia_nuevo, num_categoria_anterior, num_categoria_nuevo, num_subcategoria_anterior, num_subcategoria_nuevo, id_usuario_actualizo) VALUES (NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, OLD.nombre_subcategoria, NEW.nombre_subcategoria, OLD.habilitado, NEW.habilitado, OLD.id_materia, NEW.id_materia, OLD.num_categoria, NEW.num_categoria, OLD.num_subcategoria, NEW.num_subcategoria, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_tipo_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_tipo_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); BEGIN v_usuario := current_setting('app.usuario_actualiza_catalogo', true); IF OLD.nombre_tipo_caracteristica IS DISTINCT FROM NEW.nombre_tipo_caracteristica OR OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN INSERT INTO auditoria_actualizacion_tipos_caracteristicas (id_tipo, nombre_tipo_caracteristica_anterior, nombre_tipo_caracteristica_nuevo, habilitado_anterior, habilitado_nuevo, id_usuario_actualizo) VALUES (NEW.id_tipo, OLD.nombre_tipo_caracteristica, NEW.nombre_tipo_caracteristica, OLD.habilitado, NEW.habilitado, v_usuario); END IF; RETURN NEW; END; $function$
;

-- Función: trigger_auditoria_actualizacion_usuario
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
$function$
;

-- Función: trigger_auditoria_actualizacion_vivienda
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_vivienda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_solicitante RECORD;
    v_familia RECORD;
BEGIN
    -- Verificar si estamos en modo de creación (ignorar actualizaciones durante la creación)
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    -- Si estamos en modo creación, NO registrar como actualización
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        RETURN NEW;
    END IF;

    -- Obtener el usuario
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN NEW;
    END IF;
    
    -- Verificar si hay cambio real
    IF OLD.cant_habitaciones IS DISTINCT FROM NEW.cant_habitaciones OR
       OLD.cant_banos IS DISTINCT FROM NEW.cant_banos THEN
       
        -- Obtener datos del solicitante
        SELECT * INTO v_solicitante FROM solicitantes WHERE cedula = NEW.cedula_solicitante;
        
        -- Obtener datos de familia
        SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
        INTO v_familia
        FROM familias_y_hogares fh
        LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
        WHERE fh.cedula_solicitante = NEW.cedula_solicitante;
        
        -- Insertar auditoría
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            sexo_anterior, sexo_nuevo,
            cant_habitaciones_anterior, cant_habitaciones_nuevo,
            cant_banos_anterior, cant_banos_nuevo,
            jefe_hogar_anterior, jefe_hogar_nuevo,
            nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
            ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.cedula_solicitante,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.sexo, v_solicitante.sexo,
            OLD.cant_habitaciones, NEW.cant_habitaciones,
            OLD.cant_banos, NEW.cant_banos,
            COALESCE(v_familia.jefe_hogar, FALSE), COALESCE(v_familia.jefe_hogar, FALSE),
            v_familia.nivel_edu_jefe_desc, v_familia.nivel_edu_jefe_desc,
            v_familia.ingresos_mensuales, v_familia.ingresos_mensuales,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_artefactos
CREATE OR REPLACE FUNCTION public.trigger_auditoria_artefactos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_id_auditoria INTEGER;
    v_solicitante RECORD;
    v_familia RECORD;
    v_cedula_solicitante VARCHAR(20);
    v_artefacto_desc VARCHAR(100);
    v_artefacto RECORD;
BEGIN
    -- Solo procesar artefactos domésticos (id_tipo_caracteristica = 8)
    IF TG_OP = 'INSERT' THEN
        IF NEW.id_tipo_caracteristica != 8 THEN
            RETURN NEW;
        END IF;
        v_cedula_solicitante := NEW.cedula_solicitante;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.id_tipo_caracteristica != 8 THEN
            RETURN OLD;
        END IF;
        v_cedula_solicitante := OLD.cedula_solicitante;
    END IF;

    -- Verificar si estamos en modo de creación (ignorar actualizaciones durante la creación)
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    -- Si estamos en modo creación, NO registrar como actualización
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;

    -- Obtener el usuario que actualiza
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    -- Si no hay usuario de actualización, buscar usuario de eliminación
    IF v_usuario IS NULL OR v_usuario = '' THEN
        BEGIN
            v_usuario := current_setting('app.usuario_elimina_solicitante', true);
        EXCEPTION
            WHEN OTHERS THEN
                v_usuario := NULL;
        END;
    END IF;
    
    -- Si no hay usuario, no auditar
    IF v_usuario IS NULL OR v_usuario = '' THEN
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
    -- Obtener datos del solicitante
    SELECT s.* INTO v_solicitante
    FROM solicitantes s
    WHERE s.cedula = v_cedula_solicitante;
    
    -- Si el solicitante no existe, no auditar
    IF v_solicitante IS NULL THEN
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
    -- Obtener datos de familia
    SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
    INTO v_familia
    FROM familias_y_hogares fh
    LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
    WHERE fh.cedula_solicitante = v_cedula_solicitante;
    
    -- Obtener descripción del artefacto
    IF TG_OP = 'INSERT' THEN
        SELECT c.descripcion INTO v_artefacto_desc
        FROM caracteristicas c
        WHERE c.id_tipo_caracteristica = NEW.id_tipo_caracteristica
          AND c.num_caracteristica = NEW.num_caracteristica;
    ELSE
        SELECT c.descripcion INTO v_artefacto_desc
        FROM caracteristicas c
        WHERE c.id_tipo_caracteristica = OLD.id_tipo_caracteristica
          AND c.num_caracteristica = OLD.num_caracteristica;
    END IF;
    
    -- Insertar registro de auditoría
    INSERT INTO auditoria_actualizacion_solicitantes (
        cedula_solicitante,
        nombres_anterior, nombres_nuevo,
        apellidos_anterior, apellidos_nuevo,
        fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
        telefono_local_anterior, telefono_local_nuevo,
        telefono_celular_anterior, telefono_celular_nuevo,
        correo_electronico_anterior, correo_electronico_nuevo,
        sexo_anterior, sexo_nuevo,
        nacionalidad_anterior, nacionalidad_nuevo,
        estado_civil_anterior, estado_civil_nuevo,
        concubinato_anterior, concubinato_nuevo,
        tipo_tiempo_estudio_anterior, tipo_tiempo_estudio_nuevo,
        tiempo_estudio_anterior, tiempo_estudio_nuevo,
        id_nivel_educativo_anterior, id_nivel_educativo_nuevo,
        id_trabajo_anterior, id_trabajo_nuevo,
        id_actividad_anterior, id_actividad_nuevo,
        id_estado_anterior, id_estado_nuevo,
        num_municipio_anterior, num_municipio_nuevo,
        num_parroquia_anterior, num_parroquia_nuevo,
        jefe_hogar_anterior, jefe_hogar_nuevo,
        nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
        ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
        id_usuario_actualizo
    ) VALUES (
        v_solicitante.cedula,
        v_solicitante.nombres, v_solicitante.nombres,
        v_solicitante.apellidos, v_solicitante.apellidos,
        v_solicitante.fecha_nacimiento, v_solicitante.fecha_nacimiento,
        v_solicitante.telefono_local, v_solicitante.telefono_local,
        v_solicitante.telefono_celular, v_solicitante.telefono_celular,
        v_solicitante.correo_electronico, v_solicitante.correo_electronico,
        v_solicitante.sexo, v_solicitante.sexo,
        v_solicitante.nacionalidad, v_solicitante.nacionalidad,
        v_solicitante.estado_civil, v_solicitante.estado_civil,
        v_solicitante.concubinato, v_solicitante.concubinato,
        v_solicitante.tipo_tiempo_estudio, v_solicitante.tipo_tiempo_estudio,
        v_solicitante.tiempo_estudio, v_solicitante.tiempo_estudio,
        v_solicitante.id_nivel_educativo, v_solicitante.id_nivel_educativo,
        v_solicitante.id_trabajo, v_solicitante.id_trabajo,
        v_solicitante.id_actividad, v_solicitante.id_actividad,
        v_solicitante.id_estado, v_solicitante.id_estado,
        v_solicitante.num_municipio, v_solicitante.num_municipio,
        v_solicitante.num_parroquia, v_solicitante.num_parroquia,
        COALESCE(v_familia.jefe_hogar, FALSE), COALESCE(v_familia.jefe_hogar, FALSE),
        v_familia.nivel_edu_jefe_desc, v_familia.nivel_edu_jefe_desc,
        v_familia.ingresos_mensuales, v_familia.ingresos_mensuales,
        v_usuario
    ) RETURNING id INTO v_id_auditoria;
    
    -- Registrar el artefacto cambiado
    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'nuevo');
    ELSE
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'anterior');
    END IF;
    
    -- Registrar los artefactos que no cambiaron
    FOR v_artefacto IN
        SELECT DISTINCT c.descripcion as artefacto
        FROM asignadas_a aa
        INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica
            AND aa.num_caracteristica = c.num_caracteristica
        WHERE aa.cedula_solicitante = v_cedula_solicitante
          AND aa.id_tipo_caracteristica = 8
          AND c.descripcion != v_artefacto_desc
    LOOP
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
    END LOOP;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$function$
;

-- Función: trigger_auditoria_artefactos_delete
CREATE OR REPLACE FUNCTION public.trigger_auditoria_artefactos_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_id_auditoria INTEGER;
    v_solicitante RECORD;
    v_familia RECORD;
    v_cedula VARCHAR(20);
    v_artefacto RECORD;
BEGIN
    -- Obtener el usuario que actualiza
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    -- Procesar cada solicitante afectado (solo artefactos domésticos)
    FOR v_cedula IN 
        SELECT DISTINCT o.cedula_solicitante 
        FROM artefactos_eliminados o
        WHERE o.id_tipo_caracteristica = 8
    LOOP
        -- Obtener datos del solicitante
        SELECT s.* INTO v_solicitante
        FROM solicitantes s
        WHERE s.cedula = v_cedula;
        
        IF v_solicitante IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Obtener datos de familia
        SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
        INTO v_familia
        FROM familias_y_hogares fh
        LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
        WHERE fh.cedula_solicitante = v_cedula;
        
        -- Insertar UN solo registro de auditoría
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
            telefono_local_anterior, telefono_local_nuevo,
            telefono_celular_anterior, telefono_celular_nuevo,
            correo_electronico_anterior, correo_electronico_nuevo,
            sexo_anterior, sexo_nuevo,
            nacionalidad_anterior, nacionalidad_nuevo,
            estado_civil_anterior, estado_civil_nuevo,
            concubinato_anterior, concubinato_nuevo,
            tipo_tiempo_estudio_anterior, tipo_tiempo_estudio_nuevo,
            tiempo_estudio_anterior, tiempo_estudio_nuevo,
            id_nivel_educativo_anterior, id_nivel_educativo_nuevo,
            id_trabajo_anterior, id_trabajo_nuevo,
            id_actividad_anterior, id_actividad_nuevo,
            id_estado_anterior, id_estado_nuevo,
            num_municipio_anterior, num_municipio_nuevo,
            num_parroquia_anterior, num_parroquia_nuevo,
            jefe_hogar_anterior, jefe_hogar_nuevo,
            nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
            ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
            id_usuario_actualizo
        ) VALUES (
            v_solicitante.cedula,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.fecha_nacimiento, v_solicitante.fecha_nacimiento,
            v_solicitante.telefono_local, v_solicitante.telefono_local,
            v_solicitante.telefono_celular, v_solicitante.telefono_celular,
            v_solicitante.correo_electronico, v_solicitante.correo_electronico,
            v_solicitante.sexo, v_solicitante.sexo,
            v_solicitante.nacionalidad, v_solicitante.nacionalidad,
            v_solicitante.estado_civil, v_solicitante.estado_civil,
            v_solicitante.concubinato, v_solicitante.concubinato,
            v_solicitante.tipo_tiempo_estudio, v_solicitante.tipo_tiempo_estudio,
            v_solicitante.tiempo_estudio, v_solicitante.tiempo_estudio,
            v_solicitante.id_nivel_educativo, v_solicitante.id_nivel_educativo,
            v_solicitante.id_trabajo, v_solicitante.id_trabajo,
            v_solicitante.id_actividad, v_solicitante.id_actividad,
            v_solicitante.id_estado, v_solicitante.id_estado,
            v_solicitante.num_municipio, v_solicitante.num_municipio,
            v_solicitante.num_parroquia, v_solicitante.num_parroquia,
            v_familia.jefe_hogar, v_familia.jefe_hogar,
            v_familia.nivel_edu_jefe_desc, v_familia.nivel_edu_jefe_desc,
            v_familia.ingresos_mensuales, v_familia.ingresos_mensuales,
            v_usuario
        ) RETURNING id INTO v_id_auditoria;
        
        -- Registrar todos los artefactos ELIMINADOS de esta transacción
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM artefactos_eliminados o
            INNER JOIN caracteristicas c ON o.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND o.num_caracteristica = c.num_caracteristica
            WHERE o.cedula_solicitante = v_cedula
              AND o.id_tipo_caracteristica = 8
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'anterior');
        END LOOP;
        
        -- Registrar artefactos SIN CAMBIO (los que todavía tiene)
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM asignadas_a aa
            INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND aa.num_caracteristica = c.num_caracteristica
            WHERE aa.cedula_solicitante = v_cedula
              AND aa.id_tipo_caracteristica = 8
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
        END LOOP;
    END LOOP;
    
    RETURN NULL;
END;
$function$
;

-- Función: trigger_auditoria_artefactos_insert
CREATE OR REPLACE FUNCTION public.trigger_auditoria_artefactos_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_id_auditoria INTEGER;
    v_solicitante RECORD;
    v_familia RECORD;
    v_cedula VARCHAR(20);
    v_artefacto RECORD;
BEGIN
    -- Obtener el usuario que actualiza
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    -- Procesar cada solicitante afectado (solo artefactos domésticos)
    FOR v_cedula IN 
        SELECT DISTINCT n.cedula_solicitante 
        FROM nuevos_artefactos n
        WHERE n.id_tipo_caracteristica = 8
    LOOP
        -- Obtener datos del solicitante
        SELECT s.* INTO v_solicitante
        FROM solicitantes s
        WHERE s.cedula = v_cedula;
        
        IF v_solicitante IS NULL THEN
            CONTINUE;
        END IF;
        
        -- Obtener datos de familia
        SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
        INTO v_familia
        FROM familias_y_hogares fh
        LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
        WHERE fh.cedula_solicitante = v_cedula;
        
        -- Insertar UN solo registro de auditoría
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            fecha_nacimiento_anterior, fecha_nacimiento_nuevo,
            telefono_local_anterior, telefono_local_nuevo,
            telefono_celular_anterior, telefono_celular_nuevo,
            correo_electronico_anterior, correo_electronico_nuevo,
            sexo_anterior, sexo_nuevo,
            nacionalidad_anterior, nacionalidad_nuevo,
            estado_civil_anterior, estado_civil_nuevo,
            concubinato_anterior, concubinato_nuevo,
            tipo_tiempo_estudio_anterior, tipo_tiempo_estudio_nuevo,
            tiempo_estudio_anterior, tiempo_estudio_nuevo,
            id_nivel_educativo_anterior, id_nivel_educativo_nuevo,
            id_trabajo_anterior, id_trabajo_nuevo,
            id_actividad_anterior, id_actividad_nuevo,
            id_estado_anterior, id_estado_nuevo,
            num_municipio_anterior, num_municipio_nuevo,
            num_parroquia_anterior, num_parroquia_nuevo,
            jefe_hogar_anterior, jefe_hogar_nuevo,
            nivel_educativo_jefe_anterior, nivel_educativo_jefe_nuevo,
            ingresos_mensuales_anterior, ingresos_mensuales_nuevo,
            id_usuario_actualizo
        ) VALUES (
            v_solicitante.cedula,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.fecha_nacimiento, v_solicitante.fecha_nacimiento,
            v_solicitante.telefono_local, v_solicitante.telefono_local,
            v_solicitante.telefono_celular, v_solicitante.telefono_celular,
            v_solicitante.correo_electronico, v_solicitante.correo_electronico,
            v_solicitante.sexo, v_solicitante.sexo,
            v_solicitante.nacionalidad, v_solicitante.nacionalidad,
            v_solicitante.estado_civil, v_solicitante.estado_civil,
            v_solicitante.concubinato, v_solicitante.concubinato,
            v_solicitante.tipo_tiempo_estudio, v_solicitante.tipo_tiempo_estudio,
            v_solicitante.tiempo_estudio, v_solicitante.tiempo_estudio,
            v_solicitante.id_nivel_educativo, v_solicitante.id_nivel_educativo,
            v_solicitante.id_trabajo, v_solicitante.id_trabajo,
            v_solicitante.id_actividad, v_solicitante.id_actividad,
            v_solicitante.id_estado, v_solicitante.id_estado,
            v_solicitante.num_municipio, v_solicitante.num_municipio,
            v_solicitante.num_parroquia, v_solicitante.num_parroquia,
            v_familia.jefe_hogar, v_familia.jefe_hogar,
            v_familia.nivel_edu_jefe_desc, v_familia.nivel_edu_jefe_desc,
            v_familia.ingresos_mensuales, v_familia.ingresos_mensuales,
            v_usuario
        ) RETURNING id INTO v_id_auditoria;
        
        -- Registrar todos los artefactos AGREGADOS de esta transacción
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM nuevos_artefactos n
            INNER JOIN caracteristicas c ON n.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND n.num_caracteristica = c.num_caracteristica
            WHERE n.cedula_solicitante = v_cedula
              AND n.id_tipo_caracteristica = 8
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'nuevo');
        END LOOP;
        
        -- Registrar artefactos SIN CAMBIO (los que ya tenía antes)
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM asignadas_a aa
            INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND aa.num_caracteristica = c.num_caracteristica
            WHERE aa.cedula_solicitante = v_cedula
              AND aa.id_tipo_caracteristica = 8
              AND NOT EXISTS (
                  SELECT 1 FROM nuevos_artefactos n
                  INNER JOIN caracteristicas c2 ON n.id_tipo_caracteristica = c2.id_tipo_caracteristica 
                      AND n.num_caracteristica = c2.num_caracteristica
                  WHERE n.cedula_solicitante = v_cedula
                    AND n.id_tipo_caracteristica = 8
                    AND c2.descripcion = c.descripcion
              )
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
        END LOOP;
    END LOOP;
    
    RETURN NULL;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_accion
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_accion', true);
        v_motivo := current_setting('app.motivo_eliminacion_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_motivo IS NULL OR v_motivo = '' THEN
        v_motivo := 'Sin motivo especificado';
    END IF;
    
    INSERT INTO auditoria_eliminacion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        eliminado_por,
        motivo
    ) VALUES (
        OLD.num_accion,
        OLD.id_caso,
        OLD.detalle_accion,
        OLD.comentario,
        OLD.id_usuario_registra,
        OLD.fecha_registro,
        v_usuario,
        v_motivo
    );
    
    RETURN OLD;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_ambito_legal
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_ambito_legal()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_ambitos_legales (id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal, id_usuario_elimino, motivo) VALUES (OLD.id_materia, OLD.num_categoria, OLD.num_subcategoria, OLD.num_ambito_legal, OLD.nombre_ambito_legal, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_beneficiario
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_eliminacion_beneficiarios (
        num_beneficiario, id_caso, nombres, apellidos, cedula, id_usuario_elimino, motivo
    ) VALUES (
        OLD.num_beneficiario, OLD.id_caso, OLD.nombres, OLD.apellidos, OLD.cedula, v_usuario, current_setting('app.motivo_eliminacion_beneficiario', true)
    );
    
    RETURN OLD;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_caracteristicas (id_tipo_caracteristica, num_caracteristica, descripcion, id_usuario_elimino, motivo) VALUES (OLD.id_tipo_caracteristica, OLD.num_caracteristica, OLD.descripcion, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_caso
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN BEGIN v_usuario := current_setting('app.usuario_elimina_caso', true); v_motivo := current_setting('app.motivo_eliminacion_caso', true); EXCEPTION WHEN OTHERS THEN v_usuario := NULL; v_motivo := NULL; END; IF v_motivo IS NULL OR v_motivo = '' THEN v_motivo := 'Sin motivo especificado'; END IF; INSERT INTO auditoria_eliminacion_casos (caso_eliminado, cedula_solicitante, tramite, fecha_solicitud, eliminado_por, motivo, fecha) VALUES (OLD.id_caso, OLD.cedula, OLD.tramite, OLD.fecha_solicitud, v_usuario, v_motivo, (NOW() AT TIME ZONE 'America/Caracas')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_categoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_categoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_categorias (id_materia, num_categoria, nombre_categoria, id_usuario_elimino, motivo) VALUES (OLD.id_materia, OLD.num_categoria, OLD.nombre_categoria, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_cita
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
    motivo_eliminacion TEXT;
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_cita', true);
        motivo_eliminacion := current_setting('app.motivo_eliminacion_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
            motivo_eliminacion := NULL;
    END;
    
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_citas (
            num_cita,
            id_caso,
            fecha_encuentro,
            fecha_proxima_cita,
            orientacion,
            id_usuario_registro,
            id_usuario_elimino,
            motivo,
            fecha_eliminacion
        ) VALUES (
            OLD.num_cita,
            OLD.id_caso,
            OLD.fecha_encuentro,
            OLD.fecha_proxima_cita,
            OLD.orientacion,
            OLD.id_usuario_registro,
            cedula_usuario,
            motivo_eliminacion,
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
    
    RETURN OLD;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_condicion_actividad
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_condicion_actividad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_condiciones_actividad (id_actividad, nombre_actividad, id_usuario_elimino, motivo) VALUES (OLD.id_actividad, OLD.nombre_actividad, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_condicion_trabajo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_condicion_trabajo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_condiciones_trabajo (id_trabajo, nombre_trabajo, id_usuario_elimino, motivo) VALUES (OLD.id_trabajo, OLD.nombre_trabajo, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_estado
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_estado()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_estados (id_estado, nombre_estado, id_usuario_elimino, motivo) VALUES (OLD.id_estado, OLD.nombre_estado, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_materia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_materia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_materias (id_materia, nombre_materia, id_usuario_elimino, motivo) VALUES (OLD.id_materia, OLD.nombre_materia, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_municipio
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_municipio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_municipios (id_estado, num_municipio, nombre_municipio, id_usuario_elimino, motivo) VALUES (OLD.id_estado, OLD.num_municipio, OLD.nombre_municipio, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_nivel_educativo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_nivel_educativo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_niveles_educativos (id_nivel_educativo, descripcion, id_usuario_elimino, motivo) VALUES (OLD.id_nivel_educativo, OLD.descripcion, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_nucleo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_nucleo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_nucleos (id_nucleo, nombre_nucleo, id_estado, num_municipio, num_parroquia, id_usuario_elimino, motivo) VALUES (OLD.id_nucleo, OLD.nombre_nucleo, OLD.id_estado, OLD.num_municipio, OLD.num_parroquia, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_parroquia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_parroquia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_parroquias (id_estado, num_municipio, num_parroquia, nombre_parroquia, id_usuario_elimino, motivo) VALUES (OLD.id_estado, OLD.num_municipio, OLD.num_parroquia, OLD.nombre_parroquia, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_semestre
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_semestre()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_semestres (term, fecha_inicio, fecha_fin, id_usuario_elimino, motivo) VALUES (OLD.term, OLD.fecha_inicio, OLD.fecha_fin, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_solicitante
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_solicitante()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
    v_nivel_educativo VARCHAR(100);
    v_condicion_trabajo VARCHAR(100);
    v_condicion_actividad VARCHAR(100);
    v_estado VARCHAR(100);
    v_municipio VARCHAR(100);
    v_parroquia VARCHAR(100);
    v_vivienda RECORD;
    v_familia RECORD;
    v_caracteristicas JSONB;
    v_nivel_edu_jefe VARCHAR(100);
    v_cant_casos INTEGER;
BEGIN
    -- Obtener el usuario y motivo desde la variable de sesión
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_solicitante', true);
        v_motivo := current_setting('app.motivo_eliminacion_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    

    
    IF v_motivo IS NULL OR v_motivo = '' THEN
        v_motivo := 'Sin motivo especificado';
    END IF;
    
    -- Obtener nivel educativo del solicitante
    SELECT ne.descripcion INTO v_nivel_educativo
    FROM niveles_educativos ne
    WHERE ne.id_nivel_educativo = OLD.id_nivel_educativo;
    
    -- Obtener condición de trabajo
    SELECT ct.nombre_trabajo INTO v_condicion_trabajo
    FROM condicion_trabajo ct
    WHERE ct.id_trabajo = OLD.id_trabajo;
    
    -- Obtener condición de actividad
    SELECT ca.nombre_actividad INTO v_condicion_actividad
    FROM condicion_actividad ca
    WHERE ca.id_actividad = OLD.id_actividad;
    
    -- Obtener ubicación geográfica
    SELECT e.nombre_estado INTO v_estado
    FROM estados e
    WHERE e.id_estado = OLD.id_estado;
    
    SELECT m.nombre_municipio INTO v_municipio
    FROM municipios m
    WHERE m.id_estado = OLD.id_estado AND m.num_municipio = OLD.num_municipio;
    
    SELECT p.nombre_parroquia INTO v_parroquia
    FROM parroquias p
    WHERE p.id_estado = OLD.id_estado 
      AND p.num_municipio = OLD.num_municipio 
      AND p.num_parroquia = OLD.num_parroquia;
    
    -- Obtener datos de vivienda
    SELECT * INTO v_vivienda
    FROM viviendas v
    WHERE v.cedula_solicitante = OLD.cedula;
    
    -- Obtener características de vivienda y artefactos como JSON
    SELECT COALESCE(json_agg(json_build_object(
        'tipo', tc.nombre_tipo_caracteristica,
        'caracteristica', c.descripcion
    )), '[]'::json)::jsonb INTO v_caracteristicas
    FROM asignadas_a aa
    INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
        AND aa.num_caracteristica = c.num_caracteristica
    INNER JOIN tipo_caracteristicas tc ON c.id_tipo_caracteristica = tc.id_tipo
    WHERE aa.cedula_solicitante = OLD.cedula;
    
    -- Obtener datos de familia y hogar
    SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
    INTO v_familia
    FROM familias_y_hogares fh
    LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
    WHERE fh.cedula_solicitante = OLD.cedula;
    
    -- Verificar si tiene casos asociados - BLOQUEAR ELIMINACIÓN
    SELECT COUNT(*) INTO v_cant_casos
    FROM casos c
    WHERE c.cedula = OLD.cedula;
    
    -- Si tiene casos, bloquear la eliminación
    IF v_cant_casos > 0 THEN
        RAISE EXCEPTION 'No se puede eliminar el solicitante % (%) porque tiene % caso(s) asociado(s). Debe eliminar o reasignar los casos primero.',
            OLD.nombres || ' ' || OLD.apellidos,
            OLD.cedula,
            v_cant_casos;
    END IF;
    
    -- Registrar la auditoría con TODA la información
    INSERT INTO auditoria_eliminacion_solicitantes (
        solicitante_eliminado,
        nombres_solicitante_eliminado,
        apellidos_solicitante_eliminado,
        fecha_nacimiento,
        telefono_local,
        telefono_celular,
        correo_electronico,
        sexo,
        nacionalidad,
        estado_civil,
        concubinato,
        tipo_tiempo_estudio,
        tiempo_estudio,
        nivel_educativo,
        condicion_trabajo,
        condicion_actividad,
        estado,
        municipio,
        parroquia,
        cant_habitaciones,
        cant_banos,
        caracteristicas_vivienda,
        cant_personas,
        cant_trabajadores,
        cant_no_trabajadores,
        cant_ninos,
        cant_ninos_estudiando,
        jefe_hogar,
        ingresos_mensuales,
        nivel_educativo_jefe,
        eliminado_por,
        motivo
    ) VALUES (
        OLD.cedula,
        OLD.nombres,
        OLD.apellidos,
        OLD.fecha_nacimiento,
        OLD.telefono_local,
        OLD.telefono_celular,
        OLD.correo_electronico,
        OLD.sexo,
        OLD.nacionalidad,
        OLD.estado_civil,
        OLD.concubinato,
        OLD.tipo_tiempo_estudio,
        OLD.tiempo_estudio,
        v_nivel_educativo,
        v_condicion_trabajo,
        v_condicion_actividad,
        v_estado,
        v_municipio,
        v_parroquia,
        v_vivienda.cant_habitaciones,
        v_vivienda.cant_banos,
        v_caracteristicas,
        v_familia.cant_personas,
        v_familia.cant_trabajadores,
        v_familia.cant_no_trabajadores,
        v_familia.cant_ninos,
        v_familia.cant_ninos_estudiando,
        v_familia.jefe_hogar,
        v_familia.ingresos_mensuales,
        v_familia.nivel_edu_jefe_desc,
        v_usuario,
        v_motivo
    );
    
    -- ========================================================================
    -- ELIMINAR DEPENDENCIAS EN ORDEN CORRECTO
    -- ========================================================================
    
    -- 1. Eliminar características asignadas (asignadas_a depende de viviendas)
    DELETE FROM asignadas_a WHERE cedula_solicitante = OLD.cedula;
    
    -- 2. Eliminar vivienda
    DELETE FROM viviendas WHERE cedula_solicitante = OLD.cedula;
    
    -- 3. Eliminar familia y hogar
    DELETE FROM familias_y_hogares WHERE cedula_solicitante = OLD.cedula;
    
    -- Nota: Los casos se verifican al inicio del trigger y bloquean la eliminación
    -- si existen, por lo que nunca llegamos aquí con casos asociados.
    
    RETURN OLD;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_soporte
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_soporte', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
    END;
    
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_soportes (
            num_soporte,
            id_caso,
            nombre_archivo,
            tipo_mime,
            descripcion,
            fecha_consignacion,
            id_usuario_subio,
            id_usuario_elimino,
            motivo,
            fecha_eliminacion
        ) VALUES (
            OLD.num_soporte,
            OLD.id_caso,
            OLD.nombre_archivo,
            OLD.tipo_mime,
            OLD.descripcion,
            OLD.fecha_consignacion,
            OLD.id_usuario_subio,
            cedula_usuario,
            current_setting('app.motivo_eliminacion_soporte', true),
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
    
    RETURN OLD;
END;
$function$
;

-- Función: trigger_auditoria_eliminacion_subcategoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_subcategoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_subcategorias (id_materia, num_categoria, num_subcategoria, nombre_subcategoria, id_usuario_elimino, motivo) VALUES (OLD.id_materia, OLD.num_categoria, OLD.num_subcategoria, OLD.nombre_subcategoria, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_eliminacion_tipo_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_tipo_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ DECLARE v_usuario VARCHAR(20); v_motivo TEXT; BEGIN v_usuario := current_setting('app.usuario_elimina_catalogo', true); v_motivo := current_setting('app.motivo_eliminacion_catalogo', true); INSERT INTO auditoria_eliminacion_tipos_caracteristicas (id_tipo, nombre_tipo_caracteristica, id_usuario_elimino, motivo) VALUES (OLD.id_tipo, OLD.nombre_tipo_caracteristica, v_usuario, COALESCE(v_motivo, '')); RETURN OLD; END; $function$
;

-- Función: trigger_auditoria_insercion_accion
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := NEW.id_usuario_registra;
    END IF;
    
    INSERT INTO auditoria_insercion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        id_usuario_creo
    ) VALUES (
        NEW.num_accion,
        NEW.id_caso,
        NEW.detalle_accion,
        NEW.comentario,
        NEW.id_usuario_registra,
        NEW.fecha_registro,
        v_usuario
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_ambito_legal
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_ambito_legal()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_ambitos_legales (
            id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.num_ambito_legal, NEW.nombre_ambito_legal, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_beneficiario
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Intentar obtener de configuración por si acaso, pero preferir la columna NEW
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_insercion_beneficiarios (
        num_beneficiario, id_caso, cedula, nombres, apellidos, 
        fecha_nacimiento, sexo, tipo_beneficiario, parentesco, id_usuario_registro
    ) VALUES (
        NEW.num_beneficiario, NEW.id_caso, NEW.cedula, NEW.nombres, NEW.apellidos,
        NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco, 
        COALESCE(NEW.id_usuario_registro, v_usuario)
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_caracteristicas (
            id_tipo_caracteristica, num_caracteristica, descripcion, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_tipo_caracteristica, NEW.num_caracteristica, NEW.descripcion, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_caso
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que crea el registro
    BEGIN
        v_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    


    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_casos (
        id_caso,
        fecha_solicitud,
        fecha_inicio_caso,
        fecha_fin_caso,
        tramite,
        observaciones,
        id_nucleo,
        cedula_solicitante,
        id_materia,
        num_categoria,
        num_subcategoria,
        num_ambito_legal,
        id_usuario_creo
    ) VALUES (
        NEW.id_caso,
        NEW.fecha_solicitud,
        NEW.fecha_inicio_caso,
        NEW.fecha_fin_caso,
        NEW.tramite,
        NEW.observaciones,
        NEW.id_nucleo,
        NEW.cedula,
        NEW.id_materia,
        NEW.num_categoria,
        NEW.num_subcategoria,
        NEW.num_ambito_legal,
        v_usuario
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_categoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_categoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_categorias (
            id_materia, num_categoria, nombre_categoria, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.nombre_categoria, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_cita
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de crear la cita
    BEGIN
        cedula_usuario := current_setting('app.usuario_crea_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar el id_usuario_registro de la cita
            -- (que debería estar siempre presente)
            cedula_usuario := NEW.id_usuario_registro;
    END;
    
    -- Registrar la auditoría en la tabla de auditoría después de insertar
    -- Usamos NEW para acceder a los valores de la cita recién creada
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_insercion_citas (
            num_cita,
            id_caso,
            fecha_encuentro,
            fecha_proxima_cita,
            orientacion,
            id_usuario_creo
        ) VALUES (
            NEW.num_cita,
            NEW.id_caso,
            NEW.fecha_encuentro,
            NEW.fecha_proxima_cita,
            NEW.orientacion,
            cedula_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_condicion_actividad
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_condicion_actividad()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_condiciones_actividad (
            id_actividad, nombre_actividad, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_actividad, NEW.nombre_actividad, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_condicion_trabajo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_condicion_trabajo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_condiciones_trabajo (
            id_trabajo, nombre_trabajo, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_trabajo, NEW.nombre_trabajo, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_estado
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_estado()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_estados (
            id_estado, nombre_estado, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_estado, NEW.nombre_estado, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_estudiante
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_estudiante()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    -- Si es vacío, usar NULL (siempre debe venir un usuario válido)
    IF v_usuario = '' THEN
        v_usuario := NULL;
    END IF;

    INSERT INTO auditoria_insercion_estudiantes (
        cedula_estudiante, term, tipo_estudiante, nrc, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.cedula_estudiante, NEW.term, NEW.tipo_estudiante, NEW.nrc, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_materia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_materia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_materias (
            id_materia, nombre_materia, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.nombre_materia, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_municipio
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_municipio()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
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
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_nivel_educativo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_nivel_educativo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_niveles_educativos (
            id_nivel_educativo, descripcion, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_nivel_educativo, NEW.descripcion, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_nucleo
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_nucleo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_nucleos (
            id_nucleo, nombre_nucleo, habilitado, id_estado, num_municipio, num_parroquia, id_usuario_creo
        ) VALUES (
            NEW.id_nucleo, NEW.nombre_nucleo, NEW.habilitado, NEW.id_estado, NEW.num_municipio, NEW.num_parroquia, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_parroquia
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_parroquia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_parroquias (
            id_estado, num_municipio, num_parroquia, nombre_parroquia, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_estado, NEW.num_municipio, NEW.num_parroquia, NEW.nombre_parroquia, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_profesor
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_profesor()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    -- Si es vacío, usar NULL en lugar de 'SISTEMA'
    IF v_usuario = '' THEN
        v_usuario := NULL;
    END IF;

    INSERT INTO auditoria_insercion_profesores (
        term, cedula_profesor, tipo_profesor, id_usuario_creo, fecha_creacion
    ) VALUES (
        NEW.term, NEW.cedula_profesor, NEW.tipo_profesor, v_usuario, (NOW() AT TIME ZONE 'America/Caracas')
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_semestre
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_semestre()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_semestres (
            term, fecha_inicio, fecha_fin, habilitado, id_usuario_creo
        ) VALUES (
            NEW.term, NEW.fecha_inicio, NEW.fecha_fin, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_solicitante
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_solicitante()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que crea el registro
    BEGIN
        v_usuario := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    


    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_solicitantes (
        cedula,
        nombres,
        apellidos,
        fecha_nacimiento,
        telefono_local,
        telefono_celular,
        correo_electronico,
        sexo,
        nacionalidad,
        estado_civil,
        concubinato,
        tipo_tiempo_estudio,
        tiempo_estudio,
        id_nivel_educativo,
        id_trabajo,
        id_actividad,
        id_estado,
        num_municipio,
        num_parroquia,
        id_usuario_creo
    ) VALUES (
        NEW.cedula,
        NEW.nombres,
        NEW.apellidos,
        NEW.fecha_nacimiento,
        NEW.telefono_local,
        NEW.telefono_celular,
        NEW.correo_electronico,
        NEW.sexo,
        NEW.nacionalidad,
        NEW.estado_civil,
        NEW.concubinato,
        NEW.tipo_tiempo_estudio,
        NEW.tiempo_estudio,
        NEW.id_nivel_educativo,
        NEW.id_trabajo,
        NEW.id_actividad,
        NEW.id_estado,
        NEW.num_municipio,
        NEW.num_parroquia,
        v_usuario
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_soporte
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_soportes (
        num_soporte,
        id_caso,
        nombre_archivo,
        tipo_mime,
        descripcion,
        fecha_consignacion,
        id_usuario_subio
    ) VALUES (
        NEW.num_soporte,
        NEW.id_caso,
        NEW.nombre_archivo,
        NEW.tipo_mime,
        NEW.descripcion,
        NEW.fecha_consignacion,
        NEW.id_usuario_subio
    );
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_subcategoria
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_subcategoria()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_subcategorias (
            id_materia, num_categoria, num_subcategoria, nombre_subcategoria, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.nombre_subcategoria, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_tipo_caracteristica
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_tipo_caracteristica()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    

    
    BEGIN
        INSERT INTO auditoria_insercion_tipos_caracteristicas (
            id_tipo, nombre_tipo_caracteristica, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_tipo, NEW.nombre_tipo_caracteristica, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$function$
;

-- Función: trigger_auditoria_insercion_usuario
CREATE OR REPLACE FUNCTION public.trigger_auditoria_insercion_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    


    INSERT INTO auditoria_insercion_usuarios (
        cedula, nombres, apellidos, correo_electronico, nombre_usuario,
        telefono_celular, tipo_usuario, id_usuario_creo
    ) VALUES (
        NEW.cedula, NEW.nombres, NEW.apellidos, NEW.correo_electronico,
        NEW.nombre_usuario, NEW.telefono_celular,
        NEW.tipo_usuario, v_usuario
    );
    
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
            -- Si no se puede leer la variable, lanzar error
            RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso. Error: %', SQLERRM;
    END;
    
    -- Si no hay variable de sesión, usar NULL (permitirá que falle si es necesario)
    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso (variable vacía)';
    END IF;
    
    -- Log para debugging (solo en desarrollo)
    -- RAISE NOTICE 'Trigger: cédula_usuario = %', cedula_usuario;
    
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


-- Función Auxiliar: ensure_case_semester
-- Busca el semestre para una fecha y lo asocia al caso si no existe
CREATE OR REPLACE FUNCTION public.ensure_case_semester_func(p_id_caso INT, p_fecha DATE)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_term VARCHAR(20);
BEGIN
    IF p_fecha IS NULL THEN RETURN; END IF;

    -- Buscar semestre que incluya la fecha
    SELECT term INTO v_term
    FROM semestres
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
    LIMIT 1;

    -- Si existe un semestre para esa fecha, asociarlo
    IF v_term IS NOT NULL THEN
        INSERT INTO ocurren_en (id_caso, term)
        VALUES (p_id_caso, v_term)
        ON CONFLICT (id_caso, term) DO NOTHING;
    END IF;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_asignacion
-- Para tablas se_le_asigna y supervisa que ya tienen 'term'
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_asignacion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insertar directorio el term especificado
    INSERT INTO ocurren_en (id_caso, term)
    VALUES (NEW.id_caso, NEW.term)
    ON CONFLICT (id_caso, term) DO NOTHING;
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_caso
-- Para tabla casos (fecha_inicio_caso)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_inicio_caso);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_accion
-- Para tabla acciones (fecha_registro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_registro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_cita
-- Para tabla citas (fecha_encuentro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_encuentro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_estatus
-- Para tabla cambio_estatus (fecha)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_estatus()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_soporte
-- Para tabla soportes (fecha_consignacion)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_consignacion);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_beneficiario
-- Para tabla beneficiarios (no tiene fecha registro, usamos CURRENT_DATE)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, CURRENT_DATE);
    RETURN NEW;
END;
$function$
;

-- =========================================================
-- TRIGGERS
-- =========================================================

-- Tabla: acciones
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_actualizacion_accion BEFORE UPDATE ON public.acciones FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_accion();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_eliminacion_accion BEFORE DELETE ON public.acciones FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_accion();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_insercion_accion AFTER INSERT ON public.acciones FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_accion();

-- Tabla: ambitos_legales
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_ambito_legal ON ambitos_legales;
CREATE TRIGGER trigger_auditoria_actualizacion_ambito_legal AFTER UPDATE ON public.ambitos_legales FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_ambito_legal();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_ambito_legal ON ambitos_legales;
CREATE TRIGGER trigger_auditoria_eliminacion_ambito_legal BEFORE DELETE ON public.ambitos_legales FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_ambito_legal();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_ambito_legal ON ambitos_legales;
CREATE TRIGGER trigger_auditoria_insercion_ambito_legal AFTER INSERT ON public.ambitos_legales FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_ambito_legal();

-- Tabla: asignadas_a
DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_delete ON asignadas_a;
CREATE TRIGGER trigger_auditoria_artefactos_delete BEFORE DELETE ON public.asignadas_a FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_artefactos();

DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_insert ON asignadas_a;
CREATE TRIGGER trigger_auditoria_artefactos_insert AFTER INSERT ON public.asignadas_a FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_artefactos();

-- Tabla: beneficiarios
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_actualizacion_beneficiario AFTER UPDATE ON public.beneficiarios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_beneficiario();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_eliminacion_beneficiario AFTER DELETE ON public.beneficiarios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_beneficiario();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_insercion_beneficiario AFTER INSERT ON public.beneficiarios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_beneficiario();

-- Tabla: caracteristicas
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_caracteristica ON caracteristicas;
CREATE TRIGGER trigger_auditoria_actualizacion_caracteristica AFTER UPDATE ON public.caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_caracteristica();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_caracteristica ON caracteristicas;
CREATE TRIGGER trigger_auditoria_eliminacion_caracteristica BEFORE DELETE ON public.caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_caracteristica();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_caracteristica ON caracteristicas;
CREATE TRIGGER trigger_auditoria_insercion_caracteristica AFTER INSERT ON public.caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_caracteristica();

-- Tabla: casos
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_caso ON casos;
CREATE TRIGGER trigger_auditoria_actualizacion_caso BEFORE UPDATE ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_caso();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_caso ON casos;
CREATE TRIGGER trigger_auditoria_eliminacion_caso BEFORE DELETE ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_caso();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_caso ON casos;
CREATE TRIGGER trigger_auditoria_insercion_caso AFTER INSERT ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_caso();

DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;
CREATE TRIGGER trigger_crear_cambio_estatus_inicial AFTER INSERT ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();

-- Tabla: categorias
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_categoria ON categorias;
CREATE TRIGGER trigger_auditoria_actualizacion_categoria AFTER UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_categoria();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_categoria ON categorias;
CREATE TRIGGER trigger_auditoria_eliminacion_categoria BEFORE DELETE ON public.categorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_categoria();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_categoria ON categorias;
CREATE TRIGGER trigger_auditoria_insercion_categoria AFTER INSERT ON public.categorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_categoria();

-- Tabla: citas
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_actualizacion_cita AFTER UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_cita();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_eliminacion_cita BEFORE DELETE ON public.citas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_cita();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_cita ON citas;
CREATE TRIGGER trigger_auditoria_insercion_cita AFTER INSERT ON public.citas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_cita();

-- Tabla: condicion_actividad
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_condicion_actividad ON condicion_actividad;
CREATE TRIGGER trigger_auditoria_actualizacion_condicion_actividad AFTER UPDATE ON public.condicion_actividad FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_condicion_actividad();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_condicion_actividad ON condicion_actividad;
CREATE TRIGGER trigger_auditoria_eliminacion_condicion_actividad BEFORE DELETE ON public.condicion_actividad FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_condicion_actividad();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_condicion_actividad ON condicion_actividad;
CREATE TRIGGER trigger_auditoria_insercion_condicion_actividad AFTER INSERT ON public.condicion_actividad FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_condicion_actividad();

-- Tabla: condicion_trabajo
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_condicion_trabajo ON condicion_trabajo;
CREATE TRIGGER trigger_auditoria_actualizacion_condicion_trabajo AFTER UPDATE ON public.condicion_trabajo FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_condicion_trabajo();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_condicion_trabajo ON condicion_trabajo;
CREATE TRIGGER trigger_auditoria_eliminacion_condicion_trabajo BEFORE DELETE ON public.condicion_trabajo FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_condicion_trabajo();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_condicion_trabajo ON condicion_trabajo;
CREATE TRIGGER trigger_auditoria_insercion_condicion_trabajo AFTER INSERT ON public.condicion_trabajo FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_condicion_trabajo();

-- Tabla: estados
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_estado ON estados;
CREATE TRIGGER trigger_auditoria_actualizacion_estado AFTER UPDATE ON public.estados FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_estado();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_estado ON estados;
CREATE TRIGGER trigger_auditoria_eliminacion_estado BEFORE DELETE ON public.estados FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_estado();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_estado ON estados;
CREATE TRIGGER trigger_auditoria_insercion_estado AFTER INSERT ON public.estados FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_estado();

-- Tabla: estudiantes
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_estudiante ON estudiantes;
CREATE TRIGGER trigger_auditoria_insercion_estudiante AFTER INSERT ON public.estudiantes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_estudiante();

-- Tabla: familias_y_hogares
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_familia ON familias_y_hogares;
CREATE TRIGGER trigger_auditoria_actualizacion_familia AFTER UPDATE ON public.familias_y_hogares FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_familia();

-- Tabla: materias
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_materia ON materias;
CREATE TRIGGER trigger_auditoria_actualizacion_materia AFTER UPDATE ON public.materias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_materia();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_materia ON materias;
CREATE TRIGGER trigger_auditoria_eliminacion_materia BEFORE DELETE ON public.materias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_materia();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_materia ON materias;
CREATE TRIGGER trigger_auditoria_insercion_materia AFTER INSERT ON public.materias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_materia();

-- Tabla: municipios
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_municipio ON municipios;
CREATE TRIGGER trigger_auditoria_actualizacion_municipio AFTER UPDATE ON public.municipios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_municipio();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_municipio ON municipios;
CREATE TRIGGER trigger_auditoria_eliminacion_municipio BEFORE DELETE ON public.municipios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_municipio();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_municipio ON municipios;
CREATE TRIGGER trigger_auditoria_insercion_municipio AFTER INSERT ON public.municipios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_municipio();

-- Tabla: niveles_educativos
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_nivel_educativo ON niveles_educativos;
CREATE TRIGGER trigger_auditoria_actualizacion_nivel_educativo AFTER UPDATE ON public.niveles_educativos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_nivel_educativo();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_nivel_educativo ON niveles_educativos;
CREATE TRIGGER trigger_auditoria_eliminacion_nivel_educativo BEFORE DELETE ON public.niveles_educativos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_nivel_educativo();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_nivel_educativo ON niveles_educativos;
CREATE TRIGGER trigger_auditoria_insercion_nivel_educativo AFTER INSERT ON public.niveles_educativos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_nivel_educativo();

-- Tabla: nucleos
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_nucleo ON nucleos;
CREATE TRIGGER trigger_auditoria_actualizacion_nucleo AFTER UPDATE ON public.nucleos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_nucleo();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_nucleo ON nucleos;
CREATE TRIGGER trigger_auditoria_eliminacion_nucleo BEFORE DELETE ON public.nucleos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_nucleo();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_nucleo ON nucleos;
CREATE TRIGGER trigger_auditoria_insercion_nucleo AFTER INSERT ON public.nucleos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_nucleo();

-- Tabla: parroquias
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_parroquia ON parroquias;
CREATE TRIGGER trigger_auditoria_actualizacion_parroquia AFTER UPDATE ON public.parroquias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_parroquia();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_parroquia ON parroquias;
CREATE TRIGGER trigger_auditoria_eliminacion_parroquia BEFORE DELETE ON public.parroquias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_parroquia();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_parroquia ON parroquias;
CREATE TRIGGER trigger_auditoria_insercion_parroquia AFTER INSERT ON public.parroquias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_parroquia();

-- Tabla: profesores
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_profesor ON profesores;
CREATE TRIGGER trigger_auditoria_insercion_profesor AFTER INSERT ON public.profesores FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_profesor();

-- Tabla: semestres
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_semestre ON semestres;
CREATE TRIGGER trigger_auditoria_actualizacion_semestre AFTER UPDATE ON public.semestres FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_semestre();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_semestre ON semestres;
CREATE TRIGGER trigger_auditoria_eliminacion_semestre BEFORE DELETE ON public.semestres FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_semestre();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_semestre ON semestres;
CREATE TRIGGER trigger_auditoria_insercion_semestre AFTER INSERT ON public.semestres FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_semestre();

-- Tabla: solicitantes
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_actualizacion_solicitante AFTER UPDATE ON public.solicitantes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_solicitante();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_eliminacion_solicitante BEFORE DELETE ON public.solicitantes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_solicitante();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_insercion_solicitante AFTER INSERT ON public.solicitantes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_solicitante();

-- Tabla: soportes
DROP TRIGGER IF EXISTS trigger_auditar_eliminacion_soporte ON soportes;
CREATE TRIGGER trigger_auditar_eliminacion_soporte BEFORE DELETE ON public.soportes FOR EACH ROW EXECUTE FUNCTION trigger_auditar_eliminacion_soporte();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_soporte ON soportes;
CREATE TRIGGER trigger_auditoria_eliminacion_soporte BEFORE DELETE ON public.soportes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_soporte();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_soporte ON soportes;
CREATE TRIGGER trigger_auditoria_insercion_soporte AFTER INSERT ON public.soportes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_soporte();

-- Tabla: subcategorias
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_subcategoria ON subcategorias;
CREATE TRIGGER trigger_auditoria_actualizacion_subcategoria AFTER UPDATE ON public.subcategorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_subcategoria();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_subcategoria ON subcategorias;
CREATE TRIGGER trigger_auditoria_eliminacion_subcategoria BEFORE DELETE ON public.subcategorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_subcategoria();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_subcategoria ON subcategorias;
CREATE TRIGGER trigger_auditoria_insercion_subcategoria AFTER INSERT ON public.subcategorias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_subcategoria();

-- Tabla: tipo_caracteristicas
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_tipo_caracteristica ON tipo_caracteristicas;
CREATE TRIGGER trigger_auditoria_actualizacion_tipo_caracteristica AFTER UPDATE ON public.tipo_caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_tipo_caracteristica();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_tipo_caracteristica ON tipo_caracteristicas;
CREATE TRIGGER trigger_auditoria_eliminacion_tipo_caracteristica BEFORE DELETE ON public.tipo_caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_tipo_caracteristica();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_tipo_caracteristica ON tipo_caracteristicas;
CREATE TRIGGER trigger_auditoria_insercion_tipo_caracteristica AFTER INSERT ON public.tipo_caracteristicas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_tipo_caracteristica();

-- Tabla: usuarios
DROP TRIGGER IF EXISTS trigger_assign_nombre_usuario ON usuarios;
CREATE TRIGGER trigger_assign_nombre_usuario BEFORE INSERT OR UPDATE ON public.usuarios FOR EACH ROW WHEN (((new.nombre_usuario IS NULL) OR ((new.nombre_usuario)::text = ''::text))) EXECUTE FUNCTION assign_nombre_usuario_from_email();

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_usuario ON usuarios;
CREATE TRIGGER trigger_auditoria_insercion_usuario AFTER INSERT ON public.usuarios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_insercion_usuario();

-- Tabla: viviendas
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_vivienda ON viviendas;
CREATE TRIGGER trigger_auditoria_actualizacion_vivienda AFTER UPDATE ON public.viviendas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_actualizacion_vivienda();


-- Función: trigger_auditoria_eliminacion_caso
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ 
DECLARE 
    v_usuario VARCHAR(20); 
    v_motivo TEXT; 
BEGIN 
    BEGIN 
        v_usuario := current_setting('app.usuario_elimina_caso', true); 
        v_motivo := current_setting('app.motivo_eliminacion_caso', true); 
    EXCEPTION WHEN OTHERS THEN 
        v_usuario := NULL; 
        v_motivo := NULL; 
    END; 
    
    IF v_motivo IS NULL OR v_motivo = '' THEN 
        v_motivo := 'Sin motivo especificado'; 
    END IF; 
    
    INSERT INTO auditoria_eliminacion_casos (
        caso_eliminado, 
        cedula_solicitante, 
        tramite, 
        fecha_solicitud, 
        eliminado_por, 
        motivo,
        fecha
    ) VALUES (
        OLD.id_caso, 
        OLD.cedula, 
        OLD.tramite, 
        OLD.fecha_solicitud, 
        v_usuario, 
        v_motivo,
        (NOW() AT TIME ZONE 'America/Caracas')
    ); 
    
    RETURN OLD; 
END; 
$function$
;

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_caso ON casos;
CREATE TRIGGER trigger_auditoria_eliminacion_caso BEFORE DELETE ON public.casos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_caso();

-- Función: trigger_auditoria_eliminacion_beneficiario
CREATE OR REPLACE FUNCTION public.trigger_auditoria_eliminacion_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
        v_motivo := current_setting('app.motivo_eliminacion_beneficiario', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
        v_motivo := NULL;
    END;
    
    INSERT INTO auditoria_eliminacion_beneficiarios (
        num_beneficiario, 
        id_caso, 
        nombres, 
        apellidos, 
        cedula, 
        fecha_nacimiento,
        sexo,
        tipo_beneficiario,
        parentesco,
        id_usuario_elimino, 
        motivo
    ) VALUES (
        OLD.num_beneficiario, 
        OLD.id_caso, 
        OLD.nombres, 
        OLD.apellidos, 
        OLD.cedula,
        OLD.fecha_nac,
        OLD.sexo,
        OLD.tipo_beneficiario,
        OLD.parentesco,
        v_usuario, 
        v_motivo
    );
    
    RETURN OLD;
END;
$function$
;

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_eliminacion_beneficiario BEFORE DELETE ON public.beneficiarios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_eliminacion_beneficiario();

-- =========================================================
-- TRIGGERS DE SINCRONIZACIÓN (OCURREN_EN)
-- =========================================================

-- 1. Asignaciones (Estudiantes)
DROP TRIGGER IF EXISTS trigger_sync_semestre_asignacion ON se_le_asigna;
CREATE TRIGGER trigger_sync_semestre_asignacion
AFTER INSERT ON se_le_asigna
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

-- 2. Supervisiones (Profesores)
DROP TRIGGER IF EXISTS trigger_sync_semestre_supervision ON supervisa;
CREATE TRIGGER trigger_sync_semestre_supervision
AFTER INSERT ON supervisa
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

-- 3. Casos (Fecha Inicio)
DROP TRIGGER IF EXISTS trigger_sync_semestre_caso ON casos;
CREATE TRIGGER trigger_sync_semestre_caso
AFTER INSERT OR UPDATE OF fecha_inicio_caso ON casos
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_caso();

-- 4. Acciones
DROP TRIGGER IF EXISTS trigger_sync_semestre_accion ON acciones;
CREATE TRIGGER trigger_sync_semestre_accion
AFTER INSERT ON acciones
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_accion();

-- 5. Citas
DROP TRIGGER IF EXISTS trigger_sync_semestre_cita ON citas;
CREATE TRIGGER trigger_sync_semestre_cita
AFTER INSERT OR UPDATE OF fecha_encuentro ON citas
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_cita();

-- 6. Cambios de Estatus
DROP TRIGGER IF EXISTS trigger_sync_semestre_estatus ON cambio_estatus;
CREATE TRIGGER trigger_sync_semestre_estatus
AFTER INSERT ON cambio_estatus
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_estatus();

-- 7. Soportes
DROP TRIGGER IF EXISTS trigger_sync_semestre_soporte ON soportes;
CREATE TRIGGER trigger_sync_semestre_soporte
AFTER INSERT ON soportes
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_soporte();

-- 8. Beneficiarios
DROP TRIGGER IF EXISTS trigger_sync_semestre_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_sync_semestre_beneficiario
AFTER INSERT ON beneficiarios
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_beneficiario();