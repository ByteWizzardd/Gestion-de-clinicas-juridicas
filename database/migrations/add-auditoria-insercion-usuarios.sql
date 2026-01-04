-- Migración: Agregar tabla de auditoría para inserciones de usuarios
-- Fecha: 2026-01-XX
-- Descripción: Crea una tabla para registrar todas las inserciones de usuarios con información de auditoría

-- Crear tabla de auditoría para inserciones de usuarios
CREATE TABLE IF NOT EXISTS auditoria_insercion_usuarios (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL REFERENCES usuarios(cedula) ON DELETE SET NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL,
    telefono_celular VARCHAR(20),
    habilitado_sistema BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_usuario VARCHAR(20) NOT NULL,
    tipo_estudiante VARCHAR(50),
    tipo_profesor VARCHAR(20),
    id_usuario_creo VARCHAR(20) REFERENCES usuarios(cedula),
    fecha_creacion TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/Caracas')
);

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_usuarios_cedula ON auditoria_insercion_usuarios(cedula);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_usuarios_usuario_creo ON auditoria_insercion_usuarios(id_usuario_creo);
CREATE INDEX IF NOT EXISTS idx_auditoria_insercion_usuarios_fecha ON auditoria_insercion_usuarios(fecha_creacion);

-- Función trigger para capturar inserciones de usuarios
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Obtener el usuario que crea el registro
    BEGIN
        v_usuario := current_setting('app.usuario_crea_catalogo', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := 'SISTEMA';
    END IF;

    -- Insertar en la tabla de auditoría de inserciones
    -- tipo_estudiante y tipo_profesor se obtendrán mediante JOINs en las queries
    -- ya que estas tablas se insertan después de usuarios
    INSERT INTO auditoria_insercion_usuarios (
        cedula,
        nombres,
        apellidos,
        correo_electronico,
        nombre_usuario,
        telefono_celular,
        habilitado_sistema,
        tipo_usuario,
        tipo_estudiante,
        tipo_profesor,
        id_usuario_creo
    ) VALUES (
        NEW.cedula,
        NEW.nombres,
        NEW.apellidos,
        NEW.correo_electronico,
        NEW.nombre_usuario,
        NEW.telefono_celular,
        NEW.habilitado_sistema,
        NEW.tipo_usuario,
        NULL, -- Se obtendrá mediante JOIN en las queries
        NULL, -- Se obtendrá mediante JOIN en las queries
        v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_usuario ON usuarios;
CREATE TRIGGER trigger_auditoria_insercion_usuario
    AFTER INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_usuario();
