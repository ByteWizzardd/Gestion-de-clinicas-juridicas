-- Migración: Eliminación completa de solicitantes con auditoría
-- Fecha: 2026-01-04
-- Descripción: Actualiza la tabla de auditoría para guardar TODA la información
--              del solicitante antes de eliminarlo, y crea el trigger que elimina
--              las dependencias en el orden correcto.

-- ============================================================================
-- PARTE 1: Agregar columnas adicionales a la tabla de auditoría
-- para guardar toda la información del solicitante
-- ============================================================================

-- Datos personales
ALTER TABLE auditoria_eliminacion_solicitantes
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS telefono_local VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefono_celular VARCHAR(20),
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(100),
ADD COLUMN IF NOT EXISTS sexo CHAR(1),
ADD COLUMN IF NOT EXISTS nacionalidad CHAR(1),
ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(20),
ADD COLUMN IF NOT EXISTS concubinato BOOLEAN,
ADD COLUMN IF NOT EXISTS tipo_tiempo_estudio VARCHAR(20),
ADD COLUMN IF NOT EXISTS tiempo_estudio INTEGER,
ADD COLUMN IF NOT EXISTS nivel_educativo VARCHAR(100),
ADD COLUMN IF NOT EXISTS condicion_trabajo VARCHAR(100),
ADD COLUMN IF NOT EXISTS condicion_actividad VARCHAR(100);

-- Ubicación geográfica
ALTER TABLE auditoria_eliminacion_solicitantes
ADD COLUMN IF NOT EXISTS estado VARCHAR(100),
ADD COLUMN IF NOT EXISTS municipio VARCHAR(100),
ADD COLUMN IF NOT EXISTS parroquia VARCHAR(100);

-- Vivienda
ALTER TABLE auditoria_eliminacion_solicitantes
ADD COLUMN IF NOT EXISTS cant_habitaciones INTEGER,
ADD COLUMN IF NOT EXISTS cant_banos INTEGER,
ADD COLUMN IF NOT EXISTS caracteristicas_vivienda JSONB; -- Array de características

-- Familia y hogar
ALTER TABLE auditoria_eliminacion_solicitantes
ADD COLUMN IF NOT EXISTS cant_personas INTEGER,
ADD COLUMN IF NOT EXISTS cant_trabajadores INTEGER,
ADD COLUMN IF NOT EXISTS cant_no_trabajadores INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos INTEGER,
ADD COLUMN IF NOT EXISTS cant_ninos_estudiando INTEGER,
ADD COLUMN IF NOT EXISTS jefe_hogar BOOLEAN,
ADD COLUMN IF NOT EXISTS ingresos_mensuales DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS nivel_educativo_jefe VARCHAR(100);

-- Nota: No guardamos casos_asociados porque bloqueamos la eliminación si tiene casos

-- ============================================================================
-- PARTE 2: Trigger mejorado que guarda toda la información
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_solicitante()
RETURNS TRIGGER AS $$
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
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 3: Recrear el trigger
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_eliminacion_solicitante
    BEFORE DELETE ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_solicitante();
