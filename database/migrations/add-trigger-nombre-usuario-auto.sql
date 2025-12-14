-- Migración: Agregar trigger para asignar automáticamente nombre_usuario
-- Fecha: 2025-12-14
-- Descripción: Crea un trigger que asigna automáticamente el nombre_usuario
--              basado en el correo electrónico del cliente al registrar un usuario

-- Función trigger para asignar nombre_usuario automáticamente
CREATE OR REPLACE FUNCTION assign_nombre_usuario_from_email()
RETURNS TRIGGER AS $$
DECLARE
    cliente_correo VARCHAR(100);
    nombre_usuario_extracted VARCHAR(100);
BEGIN
    -- Si nombre_usuario ya está asignado, no hacer nada
    IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN
        RETURN NEW;
    END IF;
    
    -- Obtener el correo electrónico del cliente relacionado
    SELECT correo_electronico INTO cliente_correo
    FROM clientes
    WHERE cedula = NEW.cedula;
    
    -- Si no se encuentra el cliente o no tiene correo, lanzar error
    IF cliente_correo IS NULL OR cliente_correo = '' THEN
        RAISE EXCEPTION 'No se puede asignar nombre_usuario: el cliente con cédula % no tiene correo electrónico', NEW.cedula;
    END IF;
    
    -- Extraer el nombre_usuario (parte antes del @)
    -- Maneja tanto @ucab.edu.ve como @est.ucab.edu.ve
    nombre_usuario_extracted := SPLIT_PART(cliente_correo, '@', 1);
    
    -- Validar que el nombre_usuario extraído no esté vacío
    IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN
        RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', cliente_correo;
    END IF;
    
    -- Asignar el nombre_usuario extraído
    NEW.nombre_usuario := nombre_usuario_extracted;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta antes de insertar o actualizar en usuarios
DROP TRIGGER IF EXISTS trigger_assign_nombre_usuario ON usuarios;

CREATE TRIGGER trigger_assign_nombre_usuario
    BEFORE INSERT OR UPDATE ON usuarios
    FOR EACH ROW
    WHEN (NEW.nombre_usuario IS NULL OR NEW.nombre_usuario = '')
    EXECUTE FUNCTION assign_nombre_usuario_from_email();

-- También actualizar usuarios existentes que no tengan nombre_usuario
-- (solo si no hay restricción NOT NULL aún)
DO $$
DECLARE
    usuarios_sin_nombre INTEGER;
BEGIN
    SELECT COUNT(*) INTO usuarios_sin_nombre
    FROM usuarios
    WHERE nombre_usuario IS NULL OR nombre_usuario = '';
    
    IF usuarios_sin_nombre > 0 THEN
        -- Actualizar usuarios existentes sin nombre_usuario
        UPDATE usuarios u
        SET nombre_usuario = SPLIT_PART(c.correo_electronico, '@', 1)
        FROM clientes c
        WHERE u.cedula = c.cedula
          AND (u.nombre_usuario IS NULL OR u.nombre_usuario = '')
          AND (c.correo_electronico LIKE '%@ucab.edu.ve' OR c.correo_electronico LIKE '%@est.ucab.edu.ve');
        
        RAISE NOTICE 'Actualizados % usuario(s) existente(s) sin nombre_usuario', usuarios_sin_nombre;
    END IF;
END $$;

