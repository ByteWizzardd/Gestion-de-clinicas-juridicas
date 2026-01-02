-- Migración: Agregar trigger de auditoría para actualizaciones de citas
-- Fecha: 2026-01-02
-- Descripción: Crea un trigger AFTER UPDATE que registra la auditoría usando OLD y NEW

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
