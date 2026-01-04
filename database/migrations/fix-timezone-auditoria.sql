-- Migración: Corregir zona horaria en tablas de auditoría
-- Fecha: 2026-01-02
-- Descripción: Actualiza los DEFAULT de las columnas TIMESTAMP para usar la zona horaria de Venezuela (America/Caracas)

-- Actualizar DEFAULT de fecha_eliminacion en auditoria_eliminacion_soportes
ALTER TABLE auditoria_eliminacion_soportes
ALTER COLUMN fecha_eliminacion SET DEFAULT (NOW() AT TIME ZONE 'America/Caracas');

-- Actualizar DEFAULT de fecha_eliminacion en auditoria_eliminacion_citas
ALTER TABLE auditoria_eliminacion_citas
ALTER COLUMN fecha_eliminacion SET DEFAULT (NOW() AT TIME ZONE 'America/Caracas');

-- Actualizar DEFAULT de fecha_actualizacion en auditoria_actualizacion_citas
ALTER TABLE auditoria_actualizacion_citas
ALTER COLUMN fecha_actualizacion SET DEFAULT (NOW() AT TIME ZONE 'America/Caracas');

-- Actualizar los triggers para usar la zona horaria de Venezuela
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
    
    -- Registrar la auditoría en la tabla de auditoría antes de eliminar
    -- Usamos OLD para acceder a los valores antes de la eliminación
    -- Solo guardamos metadatos, no el documento completo para ahorrar espacio
    IF cedula_usuario IS NOT NULL AND cedula_usuario != '' THEN
        INSERT INTO auditoria_eliminacion_soportes (
            num_soporte,
            id_caso,
            nombre_archivo,
            tipo_mime,
            descripcion,
            fecha_consignacion,
            tamano_bytes,
            id_usuario_subio,
            id_usuario_elimino,
            motivo,
            fecha_eliminacion
        ) VALUES (
            OLD.num_soporte,
            OLD.id_caso,
            OLD.nombre_archivo,
            OLD.tipo_mime,
            OLD.descripcion,
            OLD.fecha_consignacion,
            LENGTH(OLD.documento_data), -- Solo guardamos el tamaño, no el archivo
            OLD.id_usuario_subio,
            cedula_usuario,
            current_setting('app.motivo_eliminacion_soporte', true), -- Motivo desde variable de sesión
            (NOW() AT TIME ZONE 'America/Caracas') -- Usar zona horaria de Venezuela
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

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
            motivo,
            fecha_eliminacion
        ) VALUES (
            OLD.num_cita,
            OLD.id_caso,
            OLD.fecha_encuentro,
            OLD.fecha_proxima_cita,
            OLD.orientacion,
            OLD.id_usuario_registro,
            cedula_usuario,
            motivo_eliminacion,
            (NOW() AT TIME ZONE 'America/Caracas') -- Usar zona horaria de Venezuela
        );
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

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
                id_usuario_actualizo,
                fecha_actualizacion
            ) VALUES (
                NEW.num_cita,
                NEW.id_caso,
                OLD.fecha_encuentro,
                OLD.fecha_proxima_cita,
                OLD.orientacion,
                NEW.fecha_encuentro,
                NEW.fecha_proxima_cita,
                NEW.orientacion,
                cedula_usuario,
                (NOW() AT TIME ZONE 'America/Caracas') -- Usar zona horaria de Venezuela
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
