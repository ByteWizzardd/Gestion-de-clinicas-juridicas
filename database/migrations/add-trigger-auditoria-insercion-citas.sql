-- Migración: Agregar trigger de auditoría para inserción de citas
-- Fecha: 2026-01-03
-- Descripción: Crea un trigger AFTER INSERT que registra la auditoría usando NEW

-- Función trigger para registrar auditoría después de insertar una cita
-- Usa NEW para capturar los datos de la cita recién creada
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_cita()
RETURNS TRIGGER AS $$
DECLARE
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión
    -- Esta variable se establece antes de crear la cita
    BEGIN
        cedula_usuario := current_setting('app.usuario_crea_cita', true);
    EXCEPTION
        WHEN OTHERS THEN
            -- Si no se puede leer la variable, usar el id_usuario_registro de la cita
            -- (que debería estar siempre presente)
            cedula_usuario := NEW.id_usuario_registro;
    END;
    
    -- Registrar la auditoría en la tabla de auditoría después de insertar
    -- Usamos NEW para acceder a los valores de la cita recién creada
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_insercion_citas (
            num_cita,
            id_caso,
            fecha_encuentro,
            fecha_proxima_cita,
            orientacion,
            id_usuario_creo
        ) VALUES (
            NEW.num_cita,
            NEW.id_caso,
            NEW.fecha_encuentro,
            NEW.fecha_proxima_cita,
            NEW.orientacion,
            cedula_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar auditoría después de insertar una cita
DROP TRIGGER IF EXISTS trigger_auditoria_insercion_cita ON citas;
CREATE TRIGGER trigger_auditoria_insercion_cita
    AFTER INSERT ON citas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_cita();
