-- =========================================================
-- MIGRACIÓN: Desactivar triggers secundarios de auditoría
-- La auditoría completa se manejará desde el código TypeScript
-- =========================================================

-- 1. Agregar columnas de familia/vivienda a la tabla de auditoría
ALTER TABLE auditoria_actualizacion_solicitantes 
ADD COLUMN IF NOT EXISTS cant_personas_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_personas_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_trabajadores_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_trabajadores_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_no_trabajadores_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_no_trabajadores_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos_estudiando_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos_estudiando_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS jefe_hogar_anterior BOOLEAN,
ADD COLUMN IF NOT EXISTS jefe_hogar_nuevo BOOLEAN,
ADD COLUMN IF NOT EXISTS ingresos_mensuales_anterior NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ingresos_mensuales_nuevo NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS id_nivel_educativo_jefe_anterior INTEGER,
ADD COLUMN IF NOT EXISTS id_nivel_educativo_jefe_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS tipo_tiempo_estudio_jefe_anterior VARCHAR(20),
ADD COLUMN IF NOT EXISTS tipo_tiempo_estudio_jefe_nuevo VARCHAR(20),
ADD COLUMN IF NOT EXISTS tiempo_estudio_jefe_anterior INTEGER,
ADD COLUMN IF NOT EXISTS tiempo_estudio_jefe_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_habitaciones_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_habitaciones_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_banos_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_banos_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS direccion_habitacion_anterior TEXT,
ADD COLUMN IF NOT EXISTS direccion_habitacion_nuevo TEXT,
-- Características de Vivienda
ADD COLUMN IF NOT EXISTS tipo_vivienda_anterior TEXT,
ADD COLUMN IF NOT EXISTS tipo_vivienda_nuevo TEXT,
ADD COLUMN IF NOT EXISTS material_piso_anterior TEXT,
ADD COLUMN IF NOT EXISTS material_piso_nuevo TEXT,
ADD COLUMN IF NOT EXISTS material_paredes_anterior TEXT,
ADD COLUMN IF NOT EXISTS material_paredes_nuevo TEXT,
ADD COLUMN IF NOT EXISTS material_techo_anterior TEXT,
ADD COLUMN IF NOT EXISTS material_techo_nuevo TEXT,
ADD COLUMN IF NOT EXISTS agua_potable_anterior TEXT,
ADD COLUMN IF NOT EXISTS agua_potable_nuevo TEXT,
ADD COLUMN IF NOT EXISTS eliminacion_aguas_negras_anterior TEXT,
ADD COLUMN IF NOT EXISTS eliminacion_aguas_negras_nuevo TEXT,
ADD COLUMN IF NOT EXISTS aseo_anterior TEXT,
ADD COLUMN IF NOT EXISTS aseo_nuevo TEXT;

-- 2. Desactivar trigger de familia (solo retorna, no hace nada)
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_familia()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Auditoría manejada desde el código de aplicación
    RETURN NEW;
END;
$function$;

-- 3. Desactivar trigger de vivienda (solo retorna, no hace nada)
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_vivienda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Auditoría manejada desde el código de aplicación
    RETURN NEW;
END;
$function$;

-- 4. Desactivar trigger principal de solicitante (también manejado desde código)
CREATE OR REPLACE FUNCTION public.trigger_auditoria_actualizacion_solicitante()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Auditoría manejada desde el código de aplicación
    RETURN NEW;
END;
$function$;

-- 5. Modificar trigger de artefactos para que use registro existente si hay uno reciente
CREATE OR REPLACE FUNCTION public.trigger_auditoria_artefactos()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_usuario VARCHAR(20);
    v_usuario_crea VARCHAR(20);
    v_id_auditoria INTEGER;
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

    -- Verificar si estamos en modo de creación (ignorar durante creación)
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

    -- Obtener el usuario que actualiza
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
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
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
    
    -- BUSCAR REGISTRO DE AUDITORÍA EXISTENTE (último minuto, mismo solicitante, mismo usuario)
    SELECT id INTO v_id_auditoria
    FROM auditoria_actualizacion_solicitantes
    WHERE cedula_solicitante = v_cedula_solicitante
      AND id_usuario_actualizo = v_usuario
      AND fecha_actualizacion >= (NOW() AT TIME ZONE 'America/Caracas') - INTERVAL '1 minute'
    ORDER BY fecha_actualizacion DESC
    LIMIT 1;
    
    -- Si NO existe registro reciente, simplemente NO crear uno nuevo
    -- (el registro ya fue creado por el código TypeScript)
    IF v_id_auditoria IS NULL THEN
        -- No crear registro, solo continuar
        IF TG_OP = 'INSERT' THEN
            RETURN NEW;
        ELSE
            RETURN OLD;
        END IF;
    END IF;
    
    -- Registrar el artefacto cambiado en el registro existente
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
          AND NOT EXISTS (
              SELECT 1 FROM auditoria_artefactos_domesticos ad
              WHERE ad.id_auditoria_solicitante = v_id_auditoria
                AND ad.artefacto = c.descripcion
          )
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

DO $$
BEGIN
    RAISE NOTICE '✅ Triggers de auditoría desactivados.';
    RAISE NOTICE '✅ Trigger de artefactos modificado para usar registros existentes.';
    RAISE NOTICE 'La auditoría ahora se maneja desde el código TypeScript.';
END $$;
