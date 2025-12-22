-- =========================================================
-- TRIGGERS Y FUNCIONES
-- =========================================================
-- Este archivo contiene triggers y funciones auxiliares
-- que complementan el schema principal (schema.sql)
-- =========================================================

-- Función para asignar nombre_usuario automáticamente desde el correo
CREATE OR REPLACE FUNCTION assign_nombre_usuario_from_email()
RETURNS TRIGGER AS $$
DECLARE
    nombre_usuario_extracted VARCHAR(100);
BEGIN
    -- Si nombre_usuario ya está asignado, no hacer nada
    IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN
        RETURN NEW;
    END IF;
    
    -- Si no tiene correo, lanzar error
    IF NEW.correo_electronico IS NULL OR NEW.correo_electronico = '' THEN
        RAISE EXCEPTION 'No se puede asignar nombre_usuario: el usuario con cédula % no tiene correo electrónico', NEW.cedula;
    END IF;
    
    -- Extraer el nombre_usuario (parte antes del @)
    nombre_usuario_extracted := SPLIT_PART(NEW.correo_electronico, '@', 1);
    
    -- Validar que el nombre_usuario extraído no esté vacío
    IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN
        RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', NEW.correo_electronico;
    END IF;
    
    -- Asignar el nombre_usuario extraído
    NEW.nombre_usuario := nombre_usuario_extracted;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar nombre_usuario automáticamente al insertar o actualizar usuarios
CREATE TRIGGER trigger_assign_nombre_usuario
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW
    WHEN (NEW.nombre_usuario IS NULL OR NEW.nombre_usuario = '')
    EXECUTE FUNCTION assign_nombre_usuario_from_email();

