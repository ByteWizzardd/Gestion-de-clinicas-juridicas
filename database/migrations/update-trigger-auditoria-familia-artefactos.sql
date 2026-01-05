-- Migración: Actualizar trigger para capturar cambios en familia y artefactos
-- Fecha: 2026-01-04
-- Descripción: Modifica el trigger para capturar cambios en familia, jefe del hogar y artefactos

-- Reemplazar la función del trigger
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_solicitante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_id_auditoria INTEGER;
    v_jefe_hogar_ant BOOLEAN;
    v_jefe_hogar_nue BOOLEAN;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
    v_ingresos_ant NUMERIC(10,2);
    v_ingresos_nue NUMERIC(10,2);
    v_artefacto RECORD;
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
    
    -- Registrar la auditoría solo si hay cambios en solicitantes
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
        
        -- Obtener datos de familia ANTES del cambio (usando OLD.cedula por si cambió la cédula)
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
        
        -- Obtener datos de familia DESPUÉS del cambio
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
        ) RETURNING id INTO v_id_auditoria;
        
        -- Registrar artefactos domésticos que existían ANTES (anterior o sin_cambio)
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM asignadas_a aa
            INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND aa.num_caracteristica = c.num_caracteristica
            WHERE aa.cedula_solicitante = OLD.cedula
              AND aa.id_tipo_caracteristica = 8
        LOOP
            -- Verificar si sigue existiendo DESPUÉS
            IF EXISTS (
                SELECT 1 FROM asignadas_a aa
                INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                    AND aa.num_caracteristica = c.num_caracteristica
                WHERE aa.cedula_solicitante = NEW.cedula
                  AND aa.id_tipo_caracteristica = 8
                  AND c.descripcion = v_artefacto.artefacto
            ) THEN
                -- Sin cambio
                INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
                VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
            ELSE
                -- Fue eliminado
                INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
                VALUES (v_id_auditoria, v_artefacto.artefacto, 'anterior');
            END IF;
        END LOOP;
        
        -- Registrar artefactos domésticos NUEVOS (que no existían antes)
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM asignadas_a aa
            INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND aa.num_caracteristica = c.num_caracteristica
            WHERE aa.cedula_solicitante = NEW.cedula
              AND aa.id_tipo_caracteristica = 8
              AND NOT EXISTS (
                  SELECT 1 FROM asignadas_a aa2
                  INNER JOIN caracteristicas c2 ON aa2.id_tipo_caracteristica = c2.id_tipo_caracteristica 
                      AND aa2.num_caracteristica = c2.num_caracteristica
                  WHERE aa2.cedula_solicitante = OLD.cedula
                    AND aa2.id_tipo_caracteristica = 8
                    AND c2.descripcion = c.descripcion
              )
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'nuevo');
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_actualizacion_solicitante
    BEFORE UPDATE ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_solicitante();
