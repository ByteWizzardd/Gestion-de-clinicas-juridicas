-- Migración: Agregar triggers de auditoría para catálogos
-- Fecha: 2026-01-03
-- Descripción: Crea triggers para registrar automáticamente eliminaciones y actualizaciones de catálogos

-- =========================================================
-- TRIGGERS DE ELIMINACIÓN
-- =========================================================

-- Estados
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_eliminacion_estados (
            id_estado, nombre_estado, habilitado, id_usuario_elimino, motivo
        ) VALUES (
            OLD.id_estado, OLD.nombre_estado, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Si la tabla no existe o hay otro error, no fallar la operación
            NULL;
    END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_estado
BEFORE DELETE ON estados
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_estado();

-- Materias
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_materia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_eliminacion_materias (
            id_materia, nombre_materia, habilitado, id_usuario_elimino, motivo
        ) VALUES (
            OLD.id_materia, OLD.nombre_materia, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Si la tabla no existe o hay otro error, no fallar la operación
            NULL;
    END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_materia
BEFORE DELETE ON materias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_materia();

-- Niveles Educativos
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_nivel_educativo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_niveles_educativos (
        id_nivel_educativo, descripcion, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_nivel_educativo, OLD.descripcion, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_nivel_educativo
BEFORE DELETE ON niveles_educativos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_nivel_educativo();

-- Nucleos
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_nucleo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_nucleos (
        id_nucleo, nombre_nucleo, habilitado, id_estado, num_municipio, num_parroquia, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_nucleo, OLD.nombre_nucleo, OLD.habilitado, OLD.id_estado, OLD.num_municipio, OLD.num_parroquia, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_nucleo
BEFORE DELETE ON nucleos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_nucleo();

-- Condiciones Trabajo
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_condicion_trabajo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_condiciones_trabajo (
        id_trabajo, nombre_trabajo, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_trabajo, OLD.nombre_trabajo, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_condicion_trabajo
BEFORE DELETE ON condicion_trabajo
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_condicion_trabajo();

-- Condiciones Actividad
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_condicion_actividad()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_condiciones_actividad (
        id_actividad, nombre_actividad, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_actividad, OLD.nombre_actividad, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_condicion_actividad
BEFORE DELETE ON condicion_actividad
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_condicion_actividad();

-- Tipos Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_tipo_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_tipos_caracteristicas (
        id_tipo, nombre_tipo_caracteristica, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_tipo, OLD.nombre_tipo_caracteristica, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_tipo_caracteristica
BEFORE DELETE ON tipo_caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_tipo_caracteristica();

-- Semestres
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_semestre()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_semestres (
        term, fecha_inicio, fecha_fin, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.term, OLD.fecha_inicio, OLD.fecha_fin, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_semestre
BEFORE DELETE ON semestres
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_semestre();

-- Municipios
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_municipio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_municipios (
        id_estado, num_municipio, nombre_municipio, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_estado, OLD.num_municipio, OLD.nombre_municipio, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_municipio
BEFORE DELETE ON municipios
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_municipio();

-- Parroquias
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_parroquia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_parroquias (
        id_estado, num_municipio, num_parroquia, nombre_parroquia, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_estado, OLD.num_municipio, OLD.num_parroquia, OLD.nombre_parroquia, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_parroquia
BEFORE DELETE ON parroquias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_parroquia();

-- Categorias
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_categoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_categorias (
        id_materia, num_categoria, nombre_categoria, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_materia, OLD.num_categoria, OLD.nombre_categoria, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_categoria
BEFORE DELETE ON categorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_categoria();

-- Subcategorias
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_subcategoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_subcategorias (
        id_materia, num_categoria, num_subcategoria, nombre_subcategoria, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_materia, OLD.num_categoria, OLD.num_subcategoria, OLD.nombre_subcategoria, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_subcategoria
BEFORE DELETE ON subcategorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_subcategoria();

-- Ambitos Legales
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_ambito_legal()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_ambitos_legales (
        id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_materia, OLD.num_categoria, OLD.num_subcategoria, OLD.num_ambito_legal, OLD.nombre_ambito_legal, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_ambito_legal
BEFORE DELETE ON ambitos_legales
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_ambito_legal();

-- Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_catalogo', true);
        v_motivo := current_setting('app.motivo_eliminacion_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
        BEGIN
            INSERT INTO auditoria_eliminacion_caracteristicas (
        id_tipo_caracteristica, num_caracteristica, descripcion, habilitado, id_usuario_elimino, motivo
    ) VALUES (
        OLD.id_tipo_caracteristica, OLD.num_caracteristica, OLD.descripcion, OLD.habilitado, v_usuario, COALESCE(v_motivo, '')
    );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_eliminacion_caracteristica
BEFORE DELETE ON caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_eliminacion_caracteristica();

-- =========================================================
-- TRIGGERS DE ACTUALIZACIÓN
-- =========================================================

-- Estados
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    -- Solo registrar si hay cambios reales
    IF OLD.nombre_estado IS DISTINCT FROM NEW.nombre_estado OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
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
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_estado
AFTER UPDATE ON estados
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_estado();

-- Materias
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_materia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_materia IS DISTINCT FROM NEW.nombre_materia OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
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
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_materia
AFTER UPDATE ON materias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_materia();

-- Niveles Educativos
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_nivel_educativo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.descripcion IS DISTINCT FROM NEW.descripcion OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_niveles_educativos (
            id_nivel_educativo, descripcion_anterior, descripcion_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.id_nivel_educativo, OLD.descripcion, NEW.descripcion,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_nivel_educativo
AFTER UPDATE ON niveles_educativos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_nivel_educativo();

-- Nucleos
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_nucleo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_nucleo IS DISTINCT FROM NEW.nombre_nucleo OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_estado IS DISTINCT FROM NEW.id_estado OR
       OLD.num_municipio IS DISTINCT FROM NEW.num_municipio OR
       OLD.num_parroquia IS DISTINCT FROM NEW.num_parroquia THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_nucleos (
            id_nucleo, nombre_nucleo_anterior, nombre_nucleo_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_estado_anterior, id_estado_nuevo,
            num_municipio_anterior, num_municipio_nuevo,
            num_parroquia_anterior, num_parroquia_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_nucleo, OLD.nombre_nucleo, NEW.nombre_nucleo,
            OLD.habilitado, NEW.habilitado,
            OLD.id_estado, NEW.id_estado,
            OLD.num_municipio, NEW.num_municipio,
            OLD.num_parroquia, NEW.num_parroquia,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_nucleo
AFTER UPDATE ON nucleos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_nucleo();

-- Condiciones Trabajo
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_condicion_trabajo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_trabajo IS DISTINCT FROM NEW.nombre_trabajo OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_condiciones_trabajo (
            id_trabajo, nombre_trabajo_anterior, nombre_trabajo_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.id_trabajo, OLD.nombre_trabajo, NEW.nombre_trabajo,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_condicion_trabajo
AFTER UPDATE ON condicion_trabajo
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_condicion_trabajo();

-- Condiciones Actividad
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_condicion_actividad()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_actividad IS DISTINCT FROM NEW.nombre_actividad OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_condiciones_actividad (
            id_actividad, nombre_actividad_anterior, nombre_actividad_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.id_actividad, OLD.nombre_actividad, NEW.nombre_actividad,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_condicion_actividad
AFTER UPDATE ON condicion_actividad
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_condicion_actividad();

-- Tipos Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_tipo_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_tipo_caracteristica IS DISTINCT FROM NEW.nombre_tipo_caracteristica OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_tipos_caracteristicas (
            id_tipo, nombre_tipo_caracteristica_anterior, nombre_tipo_caracteristica_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.id_tipo, OLD.nombre_tipo_caracteristica, NEW.nombre_tipo_caracteristica,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_tipo_caracteristica
AFTER UPDATE ON tipo_caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_tipo_caracteristica();

-- Semestres
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_semestre()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.fecha_inicio IS DISTINCT FROM NEW.fecha_inicio OR
       OLD.fecha_fin IS DISTINCT FROM NEW.fecha_fin OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_semestres (
            term, fecha_inicio_anterior, fecha_inicio_nuevo,
            fecha_fin_anterior, fecha_fin_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.term, OLD.fecha_inicio, NEW.fecha_inicio,
            OLD.fecha_fin, NEW.fecha_fin,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_semestre
AFTER UPDATE ON semestres
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_semestre();

-- Municipios
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_municipio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_municipio IS DISTINCT FROM NEW.nombre_municipio OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_municipios (
            id_estado, num_municipio, nombre_municipio_anterior, nombre_municipio_nuevo,
            habilitado_anterior, habilitado_nuevo, id_usuario_actualizo
        ) VALUES (
            NEW.id_estado, NEW.num_municipio, OLD.nombre_municipio, NEW.nombre_municipio,
            OLD.habilitado, NEW.habilitado, v_usuario
        );
        EXCEPTION
            WHEN OTHERS THEN
                -- Si la tabla no existe, no fallar la operación
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_municipio
AFTER UPDATE ON municipios
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_municipio();

-- Parroquias
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_parroquia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_parroquia
AFTER UPDATE ON parroquias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_parroquia();

-- Categorias
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_categoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_categoria IS DISTINCT FROM NEW.nombre_categoria OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_materia IS DISTINCT FROM NEW.id_materia OR
       OLD.num_categoria IS DISTINCT FROM NEW.num_categoria THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_categorias (
            id_materia, num_categoria, nombre_categoria_anterior, nombre_categoria_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_materia_anterior, id_materia_nuevo,
            num_categoria_anterior, num_categoria_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, OLD.nombre_categoria, NEW.nombre_categoria,
            OLD.habilitado, NEW.habilitado,
            OLD.id_materia, NEW.id_materia,
            OLD.num_categoria, NEW.num_categoria,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_categoria
AFTER UPDATE ON categorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_categoria();

-- Subcategorias
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_subcategoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_subcategoria IS DISTINCT FROM NEW.nombre_subcategoria OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_materia IS DISTINCT FROM NEW.id_materia OR
       OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR
       OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_subcategorias (
            id_materia, num_categoria, num_subcategoria,
            nombre_subcategoria_anterior, nombre_subcategoria_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_materia_anterior, id_materia_nuevo,
            num_categoria_anterior, num_categoria_nuevo,
            num_subcategoria_anterior, num_subcategoria_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria,
            OLD.nombre_subcategoria, NEW.nombre_subcategoria,
            OLD.habilitado, NEW.habilitado,
            OLD.id_materia, NEW.id_materia,
            OLD.num_categoria, NEW.num_categoria,
            OLD.num_subcategoria, NEW.num_subcategoria,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_subcategoria
AFTER UPDATE ON subcategorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_subcategoria();

-- Ambitos Legales
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_ambito_legal()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.nombre_ambito_legal IS DISTINCT FROM NEW.nombre_ambito_legal OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_materia IS DISTINCT FROM NEW.id_materia OR
       OLD.num_categoria IS DISTINCT FROM NEW.num_categoria OR
       OLD.num_subcategoria IS DISTINCT FROM NEW.num_subcategoria OR
       OLD.num_ambito_legal IS DISTINCT FROM NEW.num_ambito_legal THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_ambitos_legales (
            id_materia, num_categoria, num_subcategoria, num_ambito_legal,
            nombre_ambito_legal_anterior, nombre_ambito_legal_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_materia_anterior, id_materia_nuevo,
            num_categoria_anterior, num_categoria_nuevo,
            num_subcategoria_anterior, num_subcategoria_nuevo,
            num_ambito_legal_anterior, num_ambito_legal_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.num_ambito_legal,
            OLD.nombre_ambito_legal, NEW.nombre_ambito_legal,
            OLD.habilitado, NEW.habilitado,
            OLD.id_materia, NEW.id_materia,
            OLD.num_categoria, NEW.num_categoria,
            OLD.num_subcategoria, NEW.num_subcategoria,
            OLD.num_ambito_legal, NEW.num_ambito_legal,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_ambito_legal
AFTER UPDATE ON ambitos_legales
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_ambito_legal();

-- Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    IF OLD.descripcion IS DISTINCT FROM NEW.descripcion OR
       OLD.habilitado IS DISTINCT FROM NEW.habilitado OR
       OLD.id_tipo_caracteristica IS DISTINCT FROM NEW.id_tipo_caracteristica OR
       OLD.num_caracteristica IS DISTINCT FROM NEW.num_caracteristica THEN
        BEGIN
            INSERT INTO auditoria_actualizacion_caracteristicas (
            id_tipo_caracteristica, num_caracteristica,
            descripcion_anterior, descripcion_nuevo,
            habilitado_anterior, habilitado_nuevo,
            id_tipo_caracteristica_anterior, id_tipo_caracteristica_nuevo,
            num_caracteristica_anterior, num_caracteristica_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.id_tipo_caracteristica, NEW.num_caracteristica,
            OLD.descripcion, NEW.descripcion,
            OLD.habilitado, NEW.habilitado,
            OLD.id_tipo_caracteristica, NEW.id_tipo_caracteristica,
            OLD.num_caracteristica, NEW.num_caracteristica,
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_actualizacion_caracteristica
AFTER UPDATE ON caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_actualizacion_caracteristica();
