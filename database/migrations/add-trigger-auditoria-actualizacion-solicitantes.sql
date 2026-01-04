-- Migración: Agregar trigger de auditoría para actualizaciones de solicitantes
-- Fecha: 2026-01-03
-- Descripción: Crea un trigger BEFORE UPDATE que registra la auditoría usando OLD y NEW

-- Función trigger para registrar auditoría antes de actualizar un solicitante
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_solicitante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que actualiza desde la variable de sesión
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    -- Registrar la auditoría solo si hay cambios
    IF (OLD.cedula IS DISTINCT FROM NEW.cedula OR
        OLD.nombres IS DISTINCT FROM NEW.nombres OR
        OLD.apellidos IS DISTINCT FROM NEW.apellidos OR
        OLD.fecha_nacimiento IS DISTINCT FROM NEW.fecha_nacimiento OR
        OLD.telefono_local IS DISTINCT FROM NEW.telefono_local OR
        OLD.telefono_celular IS DISTINCT FROM NEW.telefono_celular OR
        OLD.correo_electronico IS DISTINCT FROM NEW.correo_electronico OR
        OLD.sexo IS DISTINCT FROM NEW.sexo OR
        OLD.nacionalidad IS DISTINCT FROM NEW.nacionalidad OR
        OLD.estado_civil IS DISTINCT FROM NEW.estado_civil OR
        OLD.concubinato IS DISTINCT FROM NEW.concubinato OR
        OLD.tipo_tiempo_estudio IS DISTINCT FROM NEW.tipo_tiempo_estudio OR
        OLD.tiempo_estudio IS DISTINCT FROM NEW.tiempo_estudio OR
        OLD.id_nivel_educativo IS DISTINCT FROM NEW.id_nivel_educativo OR
        OLD.id_trabajo IS DISTINCT FROM NEW.id_trabajo OR
        OLD.id_actividad IS DISTINCT FROM NEW.id_actividad OR
        OLD.id_estado IS DISTINCT FROM NEW.id_estado OR
        OLD.num_municipio IS DISTINCT FROM NEW.num_municipio OR
        OLD.num_parroquia IS DISTINCT FROM NEW.num_parroquia) THEN
        
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
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_actualizacion_solicitante
    BEFORE UPDATE ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_solicitante();
