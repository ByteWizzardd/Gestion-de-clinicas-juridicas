-- Migración: Agregar triggers de auditoría para inserciones de catálogos
-- Fecha: 2026-01-03
-- Descripción: Crea triggers para registrar automáticamente inserciones de catálogos

-- =========================================================
-- TRIGGERS DE INSERCIÓN
-- =========================================================

-- Estados
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_estado()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_estados (
            id_estado, nombre_estado, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_estado, NEW.nombre_estado, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Si la tabla no existe o hay otro error, no fallar la operación
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_estado
AFTER INSERT ON estados
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_estado();

-- Materias
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_materia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_materias (
            id_materia, nombre_materia, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.nombre_materia, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_materia
AFTER INSERT ON materias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_materia();

-- Niveles Educativos
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_nivel_educativo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_niveles_educativos (
            id_nivel_educativo, descripcion, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_nivel_educativo, NEW.descripcion, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_nivel_educativo
AFTER INSERT ON niveles_educativos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_nivel_educativo();

-- Nucleos
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_nucleo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_nucleos (
            id_nucleo, nombre_nucleo, habilitado, id_estado, num_municipio, num_parroquia, id_usuario_creo
        ) VALUES (
            NEW.id_nucleo, NEW.nombre_nucleo, NEW.habilitado, NEW.id_estado, NEW.num_municipio, NEW.num_parroquia, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_nucleo
AFTER INSERT ON nucleos
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_nucleo();

-- Condiciones Trabajo
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_condicion_trabajo()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_condiciones_trabajo (
            id_trabajo, nombre_trabajo, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_trabajo, NEW.nombre_trabajo, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_condicion_trabajo
AFTER INSERT ON condicion_trabajo
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_condicion_trabajo();

-- Condiciones Actividad
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_condicion_actividad()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_condiciones_actividad (
            id_actividad, nombre_actividad, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_actividad, NEW.nombre_actividad, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_condicion_actividad
AFTER INSERT ON condicion_actividad
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_condicion_actividad();

-- Tipos Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_tipo_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_tipos_caracteristicas (
            id_tipo, nombre_tipo_caracteristica, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_tipo, NEW.nombre_tipo_caracteristica, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_tipo_caracteristica
AFTER INSERT ON tipo_caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_tipo_caracteristica();

-- Semestres
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_semestre()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_semestres (
            term, fecha_inicio, fecha_fin, habilitado, id_usuario_creo
        ) VALUES (
            NEW.term, NEW.fecha_inicio, NEW.fecha_fin, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_semestre
AFTER INSERT ON semestres
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_semestre();

-- Municipios
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_municipio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_municipios (
            id_estado, num_municipio, nombre_municipio, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_estado, NEW.num_municipio, NEW.nombre_municipio, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_municipio
AFTER INSERT ON municipios
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_municipio();

-- Parroquias
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_parroquia()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_parroquias (
            id_estado, num_municipio, num_parroquia, nombre_parroquia, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_estado, NEW.num_municipio, NEW.num_parroquia, NEW.nombre_parroquia, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_parroquia
AFTER INSERT ON parroquias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_parroquia();

-- Categorias
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_categoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_categorias (
            id_materia, num_categoria, nombre_categoria, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.nombre_categoria, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_categoria
AFTER INSERT ON categorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_categoria();

-- Subcategorias
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_subcategoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_subcategorias (
            id_materia, num_categoria, num_subcategoria, nombre_subcategoria, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.nombre_subcategoria, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_subcategoria
AFTER INSERT ON subcategorias
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_subcategoria();

-- Ambitos Legales
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_ambito_legal()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_ambitos_legales (
            id_materia, num_categoria, num_subcategoria, num_ambito_legal, nombre_ambito_legal, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_materia, NEW.num_categoria, NEW.num_subcategoria, NEW.num_ambito_legal, NEW.nombre_ambito_legal, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_ambito_legal
AFTER INSERT ON ambitos_legales
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_ambito_legal();

-- Caracteristicas
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_caracteristica()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;
    
    BEGIN
        INSERT INTO auditoria_insercion_caracteristicas (
            id_tipo_caracteristica, num_caracteristica, descripcion, habilitado, id_usuario_creo
        ) VALUES (
            NEW.id_tipo_caracteristica, NEW.num_caracteristica, NEW.descripcion, NEW.habilitado, v_usuario
        );
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auditoria_insercion_caracteristica
AFTER INSERT ON caracteristicas
FOR EACH ROW
EXECUTE FUNCTION trigger_auditoria_insercion_caracteristica();
