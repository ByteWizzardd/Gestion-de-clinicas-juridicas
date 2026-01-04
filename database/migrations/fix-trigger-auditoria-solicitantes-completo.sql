-- Migración: Corregir trigger para capturar TODOS los cambios de solicitantes
-- Fecha: 2026-01-04
-- Descripción: El trigger ahora captura SIEMPRE los datos de familia y artefactos,
--              sin importar qué campo cambió. También se agrega trigger en familias_y_hogares.

-- ============================================================================
-- PARTE 1: Crear tabla para artefactos si no existe
-- ============================================================================
CREATE TABLE IF NOT EXISTS auditoria_artefactos_domesticos (
    id SERIAL PRIMARY KEY,
    id_auditoria_solicitante INTEGER REFERENCES auditoria_actualizacion_solicitantes(id) ON DELETE CASCADE,
    artefacto VARCHAR(100) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('anterior', 'nuevo', 'sin_cambio'))
);

CREATE INDEX IF NOT EXISTS idx_auditoria_artefactos_id_auditoria 
ON auditoria_artefactos_domesticos(id_auditoria_solicitante);

-- ============================================================================
-- PARTE 2: Agregar columnas faltantes a la tabla de auditoría
-- ============================================================================
ALTER TABLE auditoria_actualizacion_solicitantes
ADD COLUMN IF NOT EXISTS jefe_hogar_anterior BOOLEAN,
ADD COLUMN IF NOT EXISTS jefe_hogar_nuevo BOOLEAN,
ADD COLUMN IF NOT EXISTS nivel_educativo_jefe_anterior VARCHAR(100),
ADD COLUMN IF NOT EXISTS nivel_educativo_jefe_nuevo VARCHAR(100),
ADD COLUMN IF NOT EXISTS ingresos_mensuales_anterior NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS ingresos_mensuales_nuevo NUMERIC(10,2);

-- ============================================================================
-- PARTE 3: Trigger mejorado para solicitantes
-- Captura TODOS los datos sin importar qué campo cambió
-- ============================================================================
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
    v_hay_cambio BOOLEAN := FALSE;
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
    
    -- Verificar si hay CUALQUIER cambio en la tabla solicitantes
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
        
        v_hay_cambio := TRUE;
    END IF;
    
    -- Solo continuar si hay cambios
    IF v_hay_cambio THEN
        -- SIEMPRE obtener datos de familia (ANTES)
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
        
        -- SIEMPRE obtener datos de familia (DESPUÉS)
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
        
        -- Insertar registro de auditoría con TODOS los datos
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
        
        -- SIEMPRE registrar artefactos domésticos que existían ANTES
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

-- Recrear el trigger en solicitantes
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_actualizacion_solicitante
    AFTER UPDATE ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_solicitante();

-- ============================================================================
-- PARTE 4: Trigger para familias_y_hogares
-- Captura cambios cuando SOLO se actualiza la familia (sin tocar solicitantes)
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_familia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_id_auditoria INTEGER;
    v_solicitante RECORD;
    v_nivel_edu_jefe_ant VARCHAR(100);
    v_nivel_edu_jefe_nue VARCHAR(100);
    v_artefacto RECORD;
BEGIN
    -- Solo procesar si hay cambios relevantes
    IF (OLD.jefe_hogar IS NOT DISTINCT FROM NEW.jefe_hogar AND
        OLD.ingresos_mensuales IS NOT DISTINCT FROM NEW.ingresos_mensuales AND
        OLD.id_nivel_educativo_jefe IS NOT DISTINCT FROM NEW.id_nivel_educativo_jefe) THEN
        RETURN NEW;
    END IF;

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
    
    -- Obtener datos del solicitante asociado
    SELECT s.* INTO v_solicitante
    FROM solicitantes s
    WHERE s.cedula = NEW.cedula_solicitante;
    
    IF v_solicitante IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener nombre del nivel educativo del jefe (anterior)
    SELECT ne.descripcion INTO v_nivel_edu_jefe_ant
    FROM niveles_educativos ne
    WHERE ne.id_nivel_educativo = OLD.id_nivel_educativo_jefe;
    
    -- Obtener nombre del nivel educativo del jefe (nuevo)
    SELECT ne.descripcion INTO v_nivel_edu_jefe_nue
    FROM niveles_educativos ne
    WHERE ne.id_nivel_educativo = NEW.id_nivel_educativo_jefe;
    
    -- Insertar registro de auditoría
    -- Los campos del solicitante se mantienen iguales (anterior = nuevo)
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
        OLD.jefe_hogar, NEW.jefe_hogar,
        v_nivel_edu_jefe_ant, v_nivel_edu_jefe_nue,
        OLD.ingresos_mensuales, NEW.ingresos_mensuales,
        v_usuario
    ) RETURNING id INTO v_id_auditoria;
    
    -- También capturar artefactos actuales (todos como sin_cambio ya que no cambiaron)
    FOR v_artefacto IN 
        SELECT DISTINCT c.descripcion as artefacto
        FROM asignadas_a aa
        INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
            AND aa.num_caracteristica = c.num_caracteristica
        WHERE aa.cedula_solicitante = NEW.cedula_solicitante
          AND aa.id_tipo_caracteristica = 8
    LOOP
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en familias_y_hogares
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_familia ON familias_y_hogares;
CREATE TRIGGER trigger_auditoria_actualizacion_familia
    AFTER UPDATE ON familias_y_hogares
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_familia();

-- ============================================================================
-- PARTE 5: Trigger para asignadas_a (artefactos domésticos)
-- Captura cambios cuando se agregan/eliminan artefactos
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_cambio_artefactos()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_id_auditoria INTEGER;
    v_solicitante RECORD;
    v_familia RECORD;
    v_nivel_edu_jefe VARCHAR(100);
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
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    -- Obtener datos del solicitante
    SELECT s.* INTO v_solicitante
    FROM solicitantes s
    WHERE s.cedula = v_cedula_solicitante;
    
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
    
    -- Insertar registro de auditoría (todos los campos del solicitante iguales)
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
    
    -- Registrar el artefacto que cambió
    IF TG_OP = 'INSERT' THEN
        -- Se agregó un artefacto
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'nuevo');
        
        -- Registrar los artefactos existentes como sin_cambio
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
    ELSE
        -- Se eliminó un artefacto
        INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
        VALUES (v_id_auditoria, v_artefacto_desc, 'anterior');
        
        -- Registrar los artefactos que quedan como sin_cambio
        FOR v_artefacto IN 
            SELECT DISTINCT c.descripcion as artefacto
            FROM asignadas_a aa
            INNER JOIN caracteristicas c ON aa.id_tipo_caracteristica = c.id_tipo_caracteristica 
                AND aa.num_caracteristica = c.num_caracteristica
            WHERE aa.cedula_solicitante = v_cedula_solicitante
              AND aa.id_tipo_caracteristica = 8
        LOOP
            INSERT INTO auditoria_artefactos_domesticos (id_auditoria_solicitante, artefacto, estado)
            VALUES (v_id_auditoria, v_artefacto.artefacto, 'sin_cambio');
        END LOOP;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers en asignadas_a para INSERT y DELETE
DROP TRIGGER IF EXISTS trigger_auditoria_insert_artefacto ON asignadas_a;
CREATE TRIGGER trigger_auditoria_insert_artefacto
    AFTER INSERT ON asignadas_a
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_cambio_artefactos();

DROP TRIGGER IF EXISTS trigger_auditoria_delete_artefacto ON asignadas_a;
CREATE TRIGGER trigger_auditoria_delete_artefacto
    AFTER DELETE ON asignadas_a
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_cambio_artefactos();
