-- ============================================================================
-- FIX: Trigger de solicitantes SIN captura de artefactos
-- Los artefactos se capturan en un trigger separado en asignadas_a
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_solicitante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_hay_cambio BOOLEAN := FALSE;
    v_jefe_hogar_ant BOOLEAN;
    v_jefe_hogar_nue BOOLEAN;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
    v_ingresos_ant NUMERIC;
    v_ingresos_nue NUMERIC;
BEGIN
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
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_actualizacion_solicitante
    AFTER UPDATE ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_solicitante();
