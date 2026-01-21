-- =========================================================
-- MIGRACIÓN: Corregir triggers de auditoría para ignorar
-- actualizaciones durante el proceso de creación de solicitantes
-- y sincronización de solicitantes-usuarios
-- =========================================================
-- Fecha: 2026-01-21
-- Descripción:
-- 1. Los triggers de auditoría de actualización se disparaban
--    durante la creación de un nuevo solicitante.
-- 2. Al sincronizar datos de un solicitante que también es usuario (mismo CI),
--    se generaba una auditoría de "Usuario Actualizado" confusa.
-- 
-- Solución:
-- 1. Verificar 'app.usuario_crea_solicitante' para ignorar updates en creación.
-- 2. Verificar 'app.sync_solicitante_mode' para ignorar updates de usuario por sincronización.
-- =========================================================

-- 1. TRIGGER: trigger_auditoria_actualizacion_solicitante
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
    -- Verificar si estamos en modo de creación
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
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
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2. TRIGGER: trigger_auditoria_actualizacion_familia
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
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        RETURN NEW;
    END IF;

    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN NEW;
    END IF;
    
    IF OLD.cant_personas IS DISTINCT FROM NEW.cant_personas OR
       OLD.cant_trabajadores IS DISTINCT FROM NEW.cant_trabajadores OR
       OLD.cant_no_trabajadores IS DISTINCT FROM NEW.cant_no_trabajadores OR
       OLD.cant_ninos IS DISTINCT FROM NEW.cant_ninos OR
       OLD.cant_ninos_estudiando IS DISTINCT FROM NEW.cant_ninos_estudiando OR
       OLD.jefe_hogar IS DISTINCT FROM NEW.jefe_hogar OR
       OLD.ingresos_mensuales IS DISTINCT FROM NEW.ingresos_mensuales OR
       OLD.id_nivel_educativo_jefe IS DISTINCT FROM NEW.id_nivel_educativo_jefe THEN
       
        SELECT * INTO v_solicitante FROM solicitantes WHERE cedula = NEW.cedula_solicitante;
        
        SELECT descripcion INTO v_nivel_edu_jefe_ant
        FROM niveles_educativos WHERE id_nivel_educativo = OLD.id_nivel_educativo_jefe;
        
        SELECT descripcion INTO v_nivel_edu_jefe_nue
        FROM niveles_educativos WHERE id_nivel_educativo = NEW.id_nivel_educativo_jefe;
        
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            sexo_anterior, sexo_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.cedula_solicitante,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.sexo, v_solicitante.sexo,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 3. TRIGGER: trigger_auditoria_actualizacion_vivienda
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_vivienda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_solicitante RECORD;
BEGIN
    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        RETURN NEW;
    END IF;

    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN NEW;
    END IF;
    
    IF OLD.cant_habitaciones IS DISTINCT FROM NEW.cant_habitaciones OR
       OLD.cant_banos IS DISTINCT FROM NEW.cant_banos THEN
       
        SELECT * INTO v_solicitante FROM solicitantes WHERE cedula = NEW.cedula_solicitante;
        
        INSERT INTO auditoria_actualizacion_solicitantes (
            cedula_solicitante,
            nombres_anterior, nombres_nuevo,
            apellidos_anterior, apellidos_nuevo,
            sexo_anterior, sexo_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.cedula_solicitante,
            v_solicitante.nombres, v_solicitante.nombres,
            v_solicitante.apellidos, v_solicitante.apellidos,
            v_solicitante.sexo, v_solicitante.sexo,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 4. TRIGGER: trigger_auditoria_artefactos
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

    BEGIN
        v_usuario_crea := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario_crea := NULL;
    END;
    
    IF v_usuario_crea IS NOT NULL AND v_usuario_crea != '' THEN
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;

    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        BEGIN
            v_usuario := current_setting('app.usuario_elimina_solicitante', true);
        EXCEPTION
            WHEN OTHERS THEN
                v_usuario := NULL;
        END;
    END IF;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        RETURN OLD;
    END IF;
    
    SELECT s.* INTO v_solicitante
    FROM solicitantes s
    WHERE s.cedula = v_cedula_solicitante;
    
    IF v_solicitante IS NULL THEN
        RETURN OLD;
    END IF;
    
    SELECT fh.*, ne.descripcion as nivel_edu_jefe_desc
    INTO v_familia
    FROM familias_y_hogares fh
    LEFT JOIN niveles_educativos ne ON fh.id_nivel_educativo_jefe = ne.id_nivel_educativo
    WHERE fh.cedula_solicitante = v_cedula_solicitante;
    
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
        v_usuario
    ) RETURNING id INTO v_id_auditoria;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'nuevo');
    ELSE
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'anterior');
    END IF;
    
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
$function$;

-- 5. TRIGGER: trigger_auditoria_actualizacion_usuario
-- NUEVA FUNCIONALIDAD: Permitir ignorar auditoría en modo sincronización
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    cedula_usuario VARCHAR(20);
    v_sync_mode VARCHAR(20);
BEGIN
    -- Ignorar si estamos en modo sincronización
    BEGIN
        v_sync_mode := current_setting('app.sync_solicitante_mode', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_sync_mode := NULL;
    END;

    IF v_sync_mode IS NOT NULL AND v_sync_mode = 'true' THEN
        RETURN NEW;
    END IF;

    BEGIN
        cedula_usuario := current_setting('app.usuario_actualiza_usuario', true);
    EXCEPTION
        WHEN OTHERS THEN
            cedula_usuario := NULL;
    END;
    
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        IF (OLD.nombres IS DISTINCT FROM NEW.nombres) OR
           (OLD.apellidos IS DISTINCT FROM NEW.apellidos) OR
           (OLD.correo_electronico IS DISTINCT FROM NEW.correo_electronico) OR
           (OLD.nombre_usuario IS DISTINCT FROM NEW.nombre_usuario) OR
           (OLD.telefono_celular IS DISTINCT FROM NEW.telefono_celular) OR
           (OLD.habilitado_sistema IS DISTINCT FROM NEW.habilitado_sistema) OR
           (OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario) THEN
            
            INSERT INTO auditoria_actualizacion_usuarios (
                ci_usuario,
                nombres_anterior,
                apellidos_anterior,
                correo_electronico_anterior,
                nombre_usuario_anterior,
                telefono_celular_anterior,
                habilitado_sistema_anterior,
                tipo_usuario_anterior,
                nombres_nuevo,
                apellidos_nuevo,
                correo_electronico_nuevo,
                nombre_usuario_nuevo,
                telefono_celular_nuevo,
                habilitado_sistema_nuevo,
                tipo_usuario_nuevo,
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
                NEW.nombres,
                NEW.apellidos,
                NEW.correo_electronico,
                NEW.nombre_usuario,
                NEW.telefono_celular,
                NEW.habilitado_sistema,
                NEW.tipo_usuario,
                cedula_usuario,
                (NOW() AT TIME ZONE 'America/Caracas')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada exitosamente.';
END $$;
