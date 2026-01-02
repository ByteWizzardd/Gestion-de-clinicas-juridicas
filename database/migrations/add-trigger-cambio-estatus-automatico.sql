-- Migración: Agregar trigger para crear automáticamente cambio_estatus al registrar un caso
-- Fecha: 2025-12-27
-- Descripción: Crea un trigger que automáticamente inserta un registro en cambio_estatus
--              cuando se crea un nuevo caso, con estatus 'Asesoría' y la cédula del usuario
--              que lo registra

-- Paso 1: Agregar campo id_usuario_registra a la tabla casos (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'casos' 
        AND column_name = 'id_usuario_registra'
    ) THEN
        ALTER TABLE casos 
        ADD COLUMN id_usuario_registra VARCHAR(20) REFERENCES usuarios(cedula);
        
        COMMENT ON COLUMN casos.id_usuario_registra IS 'Cédula del usuario que registró el caso';
    END IF;
END $$;

-- Paso 2: Crear función trigger para insertar cambio_estatus automáticamente
CREATE OR REPLACE FUNCTION trigger_crear_cambio_estatus_inicial()
RETURNS TRIGGER AS $$
DECLARE
    num_cambio_actual INTEGER;
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario que registra el caso
    -- Si id_usuario_registra está NULL, usar un usuario por defecto (coordinador) o lanzar error
    IF NEW.id_usuario_registra IS NULL THEN
        -- Intentar obtener un coordinador como fallback
        SELECT cedula INTO cedula_usuario
        FROM usuarios
        WHERE tipo_usuario = 'Coordinador'
        LIMIT 1;
        
        -- Si no hay coordinador, lanzar error
        IF cedula_usuario IS NULL THEN
            RAISE EXCEPTION 'No se puede crear cambio de estatus: el caso no tiene id_usuario_registra y no hay coordinador disponible';
        END IF;
    ELSE
        cedula_usuario := NEW.id_usuario_registra;
    END IF;
    
    -- Calcular el num_cambio (será 1 para el primer cambio)
    SELECT COALESCE(MAX(num_cambio), 0) + 1 INTO num_cambio_actual
    FROM cambio_estatus
    WHERE id_caso = NEW.id_caso;
    
    -- Insertar el cambio de estatus inicial con estatus 'Asesoría'
    INSERT INTO cambio_estatus (
        num_cambio,
        id_caso,
        nuevo_estatus,
        id_usuario_cambia,
        motivo,
        fecha
    ) VALUES (
        num_cambio_actual,
        NEW.id_caso,
        'Asesoría',
        cedula_usuario,
        'Registro del caso',
        COALESCE(NEW.fecha_solicitud, CURRENT_DATE)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 3: Crear el trigger que se ejecuta después de insertar un caso
DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;

CREATE TRIGGER trigger_crear_cambio_estatus_inicial
    AFTER INSERT ON casos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();

-- Paso 4: Comentarios
COMMENT ON FUNCTION trigger_crear_cambio_estatus_inicial() IS 
'Trigger que crea automáticamente un registro en cambio_estatus cuando se inserta un nuevo caso, con estatus Asesoría';

