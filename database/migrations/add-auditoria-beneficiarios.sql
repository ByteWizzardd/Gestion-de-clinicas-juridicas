-- Migración: Agregar auditoría completa para beneficiarios (Inserción, Actualización, Eliminación)
-- Versión corregida para PK compuesta (num_beneficiario, id_caso) y evitando FK restrictivas en auditoría

-- 1. Auditoría Inserción
CREATE TABLE IF NOT EXISTS auditoria_insercion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    cedula VARCHAR(20),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo VARCHAR(20) NOT NULL,
    tipo_beneficiario VARCHAR(20) NOT NULL,
    parentesco VARCHAR(50) NOT NULL,
    id_usuario_registro VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);



-- 2. Auditoría Actualización
CREATE TABLE IF NOT EXISTS auditoria_actualizacion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER NOT NULL,
    id_caso INTEGER NOT NULL,
    
    -- Valores Anteriores
    cedula_anterior VARCHAR(20),
    nombres_anterior VARCHAR(100),
    apellidos_anterior VARCHAR(100),
    fecha_nacimiento_anterior DATE,
    sexo_anterior VARCHAR(20),
    tipo_beneficiario_anterior VARCHAR(20),
    parentesco_anterior VARCHAR(50),
    
    -- Valores Nuevos
    cedula_nuevo VARCHAR(20),
    nombres_nuevo VARCHAR(100),
    apellidos_nuevo VARCHAR(100),
    fecha_nacimiento_nuevo DATE,
    sexo_nuevo VARCHAR(20),
    tipo_beneficiario_nuevo VARCHAR(20),
    parentesco_nuevo VARCHAR(50),
    
    id_usuario_actualizo VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_actualizacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);



-- 3. Auditoría Eliminación
CREATE TABLE IF NOT EXISTS auditoria_eliminacion_beneficiarios (
    id SERIAL PRIMARY KEY,
    num_beneficiario INTEGER,
    cedula VARCHAR(20),
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    id_caso INTEGER,
    id_usuario_elimino VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_eliminacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);




-- FUNCIONES TRIGGER

-- Trigger Inserción
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_insercion_beneficiarios (
        num_beneficiario, id_caso, cedula, nombres, apellidos, 
        fecha_nacimiento, sexo, tipo_beneficiario, parentesco, id_usuario_registro
    ) VALUES (
        NEW.num_beneficiario, NEW.id_caso, NEW.cedula, NEW.nombres, NEW.apellidos,
        NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco, v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger Actualización
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    IF (OLD.cedula IS DISTINCT FROM NEW.cedula) OR
       (OLD.nombres IS DISTINCT FROM NEW.nombres) OR
       (OLD.apellidos IS DISTINCT FROM NEW.apellidos) OR
       (OLD.fecha_nac IS DISTINCT FROM NEW.fecha_nac) OR
       (OLD.sexo IS DISTINCT FROM NEW.sexo) OR
       (OLD.tipo_beneficiario IS DISTINCT FROM NEW.tipo_beneficiario) OR
       (OLD.parentesco IS DISTINCT FROM NEW.parentesco) THEN
       
        INSERT INTO auditoria_actualizacion_beneficiarios (
            num_beneficiario, id_caso,
            cedula_anterior, nombres_anterior, apellidos_anterior, fecha_nacimiento_anterior, sexo_anterior, tipo_beneficiario_anterior, parentesco_anterior,
            cedula_nuevo, nombres_nuevo, apellidos_nuevo, fecha_nacimiento_nuevo, sexo_nuevo, tipo_beneficiario_nuevo, parentesco_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_beneficiario, NEW.id_caso,
            OLD.cedula, OLD.nombres, OLD.apellidos, OLD.fecha_nac, OLD.sexo, OLD.tipo_beneficiario, OLD.parentesco,
            NEW.cedula, NEW.nombres, NEW.apellidos, NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger Eliminación
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_eliminacion_beneficiarios (
        num_beneficiario, cedula, nombres, apellidos, id_caso, id_usuario_elimino
    ) VALUES (
        OLD.num_beneficiario, OLD.cedula, OLD.nombres, OLD.apellidos, OLD.id_caso, v_usuario
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ASIGNAR TRIGGERS
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_insercion_beneficiario
    AFTER INSERT ON beneficiarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_beneficiario();

DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_actualizacion_beneficiario
    AFTER UPDATE ON beneficiarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_beneficiario();

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_auditoria_eliminacion_beneficiario
    AFTER DELETE ON beneficiarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_beneficiario();
