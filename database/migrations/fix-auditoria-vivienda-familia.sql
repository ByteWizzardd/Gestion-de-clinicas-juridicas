-- ============================================================================
-- FIX: Agregar auditoría para vivienda y familia/hogar
-- Agregar columnas a la tabla de auditoría y crear triggers
-- ============================================================================

-- 1. Agregar columnas de vivienda a la tabla de auditoría
ALTER TABLE auditoria_actualizacion_solicitantes
ADD COLUMN IF NOT EXISTS cant_habitaciones_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_habitaciones_nuevo INTEGER,
ADD COLUMN IF NOT EXISTS cant_banos_anterior INTEGER,
ADD COLUMN IF NOT EXISTS cant_banos_nuevo INTEGER;

-- 2. Agregar columnas de familia/hogar a la tabla de auditoría
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
ADD COLUMN IF NOT EXISTS cant_ninos_estudiando_nuevo INTEGER;

-- 3. Trigger para la tabla viviendas
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_vivienda()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_solicitante RECORD;
    v_familia RECORD;
BEGIN
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_vivienda ON viviendas;
CREATE TRIGGER trigger_auditoria_actualizacion_vivienda
    AFTER UPDATE ON viviendas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_vivienda();

-- 4. Trigger para la tabla familias_y_hogares
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_familia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_solicitante RECORD;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
BEGIN
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_familia ON familias_y_hogares;
CREATE TRIGGER trigger_auditoria_actualizacion_familia
    AFTER UPDATE ON familias_y_hogares
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_familia();
