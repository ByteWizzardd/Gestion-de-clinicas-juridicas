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

-- Trigger para registrar auditoría después de actualizar una cita
DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_cita ON citas;
CREATE TRIGGER trigger_auditoria_actualizacion_cita
    AFTER UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_cita();

-- =========================================================
-- TRIGGERS DE AUDITORÍA DE ACCIONES
-- =========================================================

-- Función trigger para registrar auditoría de inserción de acciones
CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_registra', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF v_usuario IS NULL OR v_usuario = '' THEN
        v_usuario := NEW.id_usuario_registra;
    END IF;
    
    INSERT INTO auditoria_insercion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        id_usuario_creo
    ) VALUES (
        NEW.num_accion,
        NEW.id_caso,
        NEW.detalle_accion,
        NEW.comentario,
        NEW.id_usuario_registra,
        NEW.fecha_registro,
        v_usuario
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_insercion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_insercion_accion
    AFTER INSERT ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_insercion_accion();

-- Función trigger para registrar auditoría de actualización de acciones
-- Los ejecutores se insertan en tabla normalizada desde el servicio DESPUÉS de la actualización
CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_actualiza_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
    END;
    
    IF (OLD.detalle_accion IS DISTINCT FROM NEW.detalle_accion OR
        OLD.comentario IS DISTINCT FROM NEW.comentario OR
        OLD.id_usuario_registra IS DISTINCT FROM NEW.id_usuario_registra OR
        OLD.fecha_registro IS DISTINCT FROM NEW.fecha_registro) THEN
        
        INSERT INTO auditoria_actualizacion_acciones (
            num_accion,
            id_caso,
            detalle_accion_anterior, detalle_accion_nuevo,
            comentario_anterior, comentario_nuevo,
            id_usuario_registra_anterior, id_usuario_registra_nuevo,
            fecha_registro_anterior, fecha_registro_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_accion,
            NEW.id_caso,
            OLD.detalle_accion, NEW.detalle_accion,
            OLD.comentario, NEW.comentario,
            OLD.id_usuario_registra, NEW.id_usuario_registra,
            OLD.fecha_registro, NEW.fecha_registro,
            v_usuario
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_actualizacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_actualizacion_accion
    BEFORE UPDATE ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_actualizacion_accion();

-- Función trigger para registrar auditoría de eliminación de acciones
-- Los ejecutores se insertan en tabla normalizada desde el servicio DESPUÉS de la eliminación
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_accion()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
    v_motivo TEXT;
BEGIN
    BEGIN
        v_usuario := current_setting('app.usuario_elimina_accion', true);
        v_motivo := current_setting('app.motivo_eliminacion_accion', true);
    EXCEPTION
        WHEN OTHERS THEN
            v_usuario := NULL;
            v_motivo := NULL;
    END;
    
    IF v_motivo IS NULL OR v_motivo = '' THEN
        v_motivo := 'Sin motivo especificado';
    END IF;
    
    INSERT INTO auditoria_eliminacion_acciones (
        num_accion,
        id_caso,
        detalle_accion,
        comentario,
        id_usuario_registra,
        fecha_registro,
        eliminado_por,
        motivo
    ) VALUES (
        OLD.num_accion,
        OLD.id_caso,
        OLD.detalle_accion,
        OLD.comentario,
        OLD.id_usuario_registra,
        OLD.fecha_registro,
        v_usuario,
        v_motivo
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_eliminacion_accion ON acciones;
CREATE TRIGGER trigger_auditoria_eliminacion_accion
    BEFORE DELETE ON acciones
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auditoria_eliminacion_accion();