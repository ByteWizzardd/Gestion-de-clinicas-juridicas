-- ============================================================================
-- FIX: Trigger de artefactos - versión final
-- Este trigger audita cambios en artefactos domésticos (tipo 8)
-- Solo se dispara cuando hay cambios reales en asignadas_a
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_auditoria_artefactos()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
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
$$ LANGUAGE plpgsql;

-- Crear los triggers
DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_insert ON asignadas_a;
DROP TRIGGER IF EXISTS trigger_auditoria_artefactos_delete ON asignadas_a;

CREATE TRIGGER trigger_auditoria_artefactos_insert
    AFTER INSERT ON asignadas_a
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_artefactos();

CREATE TRIGGER trigger_auditoria_artefactos_delete
    BEFORE DELETE ON asignadas_a
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_artefactos();
