-- Migración: Agregar tabla de auditoría para inserciones de solicitantes
-- Fecha: 2026-01-03
-- Descripción: Crea una tabla para registrar todas las inserciones de solicitantes con información de auditoría

-- Crear tabla de auditoría para inserciones de solicitantes
CREATE TABLE IF NOT EXISTS auditoria_insercion_solicitantes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) REFERENCES solicitantes(cedula) ON DELETE SET NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    fecha_nacimiento DATE,
    telefono_local VARCHAR(20),
    telefono_celular VARCHAR(20),
    correo_electronico VARCHAR(100),
    sexo VARCHAR(20),
    nacionalidad VARCHAR(20),
    estado_civil VARCHAR(20),
    concubinato BOOLEAN,
    tipo_tiempo_estudio VARCHAR(20),
    tiempo_estudio INTEGER,
    id_nivel_educativo INTEGER,
    id_trabajo INTEGER,
    id_actividad INTEGER,
    id_estado INTEGER,
    num_municipio INTEGER,
    num_parroquia INTEGER,
    id_usuario_creo VARCHAR(20) REFERENCES usuarios(cedula) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_solicitantes_cedula ON auditoria_insercion_solicitantes(cedula);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_solicitantes_usuario_creo ON auditoria_insercion_solicitantes(id_usuario_creo);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_solicitantes_fecha ON auditoria_insercion_solicitantes(fecha_creacion);

-- Función trigger para capturar inserciones de solicitantes
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_solicitante()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que crea el registro
    BEGIN
        v_usuario := current_setting('app.usuario_crea_solicitante', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;

    -- Insertar en la tabla de auditoría de inserciones
    INSERT INTO auditoria_insercion_solicitantes (
        cedula,
        nombres,
        apellidos,
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
        id_nivel_educativo,
        id_trabajo,
        id_actividad,
        id_estado,
        num_municipio,
        num_parroquia,
        id_usuario_creo
    ) VALUES (
        NEW.cedula,
        NEW.nombres,
        NEW.apellidos,
        NEW.fecha_nacimiento,
        NEW.telefono_local,
        NEW.telefono_celular,
        NEW.correo_electronico,
        NEW.sexo,
        NEW.nacionalidad,
        NEW.estado_civil,
        NEW.concubinato,
        NEW.tipo_tiempo_estudio,
        NEW.tiempo_estudio,
        NEW.id_nivel_educativo,
        NEW.id_trabajo,
        NEW.id_actividad,
        NEW.id_estado,
        NEW.num_municipio,
        NEW.num_parroquia,
        v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_solicitante ON solicitantes;
CREATE TRIGGER trigger_auditoria_insercion_solicitante
    AFTER INSERT ON solicitantes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_solicitante();
