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

-- Función trigger para crear automáticamente cambio_estatus al registrar un caso
CREATE OR REPLACE FUNCTION trigger_crear_cambio_estatus_inicial()
RETURNS TRIGGER AS $$
DECLARE
    num_cambio_actual INTEGER;
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de insertar el caso
    BEGIN
        cedula_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, lanzar error
            RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso. Error: %', SQLERRM;
    END;
    
    -- Si no hay variable de sesión, usar NULL (permitirá que falle si es necesario)
    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso (variable vacía)';
    END IF;
    
    -- Log para debugging (solo en desarrollo)
    -- RAISE NOTICE 'Trigger: cédula_usuario = %', cedula_usuario;
    
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

-- Trigger para crear automáticamente cambio_estatus al insertar un caso
DROP TRIGGER IF EXISTS trigger_crear_cambio_estatus_inicial ON casos;
CREATE TRIGGER trigger_crear_cambio_estatus_inicial
    AFTER INSERT ON casos
    FOR EACH ROW
    EXECUTE FUNCTION trigger_crear_cambio_estatus_inicial();

-- Función trigger para registrar auditoría antes de eliminar un soporte
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_soporte()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de eliminar el soporte
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_soporte', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar NULL (no bloquear la eliminación)
            cedula_usuario := NULL;
    END;
    
    -- Si hay usuario, registrar la auditoría antes de eliminar
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        -- Actualizar los campos de auditoría antes de que se elimine el registro
        UPDATE soportes
        SET id_usuario_elimino = cedula_usuario,
            fecha_eliminacion = CURRENT_DATE
        WHERE id_caso = OLD.id_caso 
          AND num_soporte = OLD.num_soporte;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría antes de eliminar un soporte
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_soporte ON soportes;
CREATE TRIGGER trigger_auditoria_eliminacion_soporte
    BEFORE DELETE ON soportes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_soporte();

-- Función trigger para registrar auditoría antes de eliminar una cita
-- Solo guarda metadatos de la cita, no información adicional del caso
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
    motivo_eliminacion TEXT;
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de eliminar la cita
    BEGIN
        cedula_usuario := current_setting('app.usuario_elimina_cita', true);
        motivo_eliminacion := current_setting('app.motivo_eliminacion_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar NULL (no bloquear la eliminación)
            cedula_usuario := NULL;
            motivo_eliminacion := NULL;
    END;
    
    -- Registrar la auditoría en la tabla de auditoría antes de eliminar
    -- Usamos OLD para acceder a los valores antes de la eliminación
    -- Solo guardamos metadatos de la cita eliminada
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_citas (
            num_cita,
            id_caso,
            fecha_encuentro,
            fecha_proxima_cita,
            orientacion,
            id_usuario_registro,
            id_usuario_elimino,
            motivo
        ) VALUES (
            OLD.num_cita,
            OLD.id_caso,
            OLD.fecha_encuentro,
            OLD.fecha_proxima_cita,
            OLD.orientacion,
            OLD.id_usuario_registro,
            cedula_usuario,
            motivo_eliminacion
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría antes de eliminar una cita
DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_eliminacion_cita
    BEFORE DELETE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_cita();

-- Función trigger para registrar auditoría después de actualizar una cita
-- Usa OLD para valores anteriores y NEW para valores nuevos
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de actualizar la cita
    BEGIN
        cedula_usuario := current_setting('app.usuario_actualiza_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar NULL (no bloquear la actualización)
            cedula_usuario := NULL;
    END;
    
    -- Registrar la auditoría solo si hay cambios reales y hay usuario
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        -- Solo registrar si hubo cambios en los campos relevantes
        IF (OLD.fecha_encuentro IS DISTINCT FROM NEW.fecha_encuentro) OR
           (OLD.fecha_proxima_cita IS DISTINCT FROM NEW.fecha_proxima_cita) OR
           (OLD.orientacion IS DISTINCT FROM NEW.orientacion) THEN
            
            INSERT INTO auditoria_actualizacion_citas (
                num_cita,
                id_caso,
                fecha_encuentro_anterior,
                fecha_proxima_cita_anterior,
                orientacion_anterior,
                fecha_encuentro_nueva,
                fecha_proxima_cita_nueva,
                orientacion_nueva,
                id_usuario_actualizo
            ) VALUES (
                NEW.num_cita,
                NEW.id_caso,
                OLD.fecha_encuentro,
                OLD.fecha_proxima_cita,
                OLD.orientacion,
                NEW.fecha_encuentro,
                NEW.fecha_proxima_cita,
                NEW.orientacion,
                cedula_usuario
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría después de actualizar una cita
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_actualizacion_cita
    AFTER UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_cita();