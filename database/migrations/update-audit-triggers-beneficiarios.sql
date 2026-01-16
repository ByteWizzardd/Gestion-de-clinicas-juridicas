-- Actualizar triggers de auditoría para beneficiarios para usar las columnas de usuario en la tabla
-- Esto permite que el ID del usuario se registre correctamente si se pasa en la sentencia INSERT/UPDATE

CREATE OR REPLACE FUNCTION trigger_auditoria_insercion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    -- Intentar obtener de configuración por si acaso, pero preferir la columna NEW
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_insercion_beneficiarios (
        num_beneficiario, id_caso, cedula, nombres, apellidos, 
        fecha_nacimiento, sexo, tipo_beneficiario, parentesco, id_usuario_registro
    ) VALUES (
        NEW.num_beneficiario, NEW.id_caso, NEW.cedula, NEW.nombres, NEW.apellidos,
        NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco, 
        COALESCE(NEW.id_usuario_registro, v_usuario)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_auditoria_actualizacion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    IF (OLD.cedula IS DISTINCT FROM NEW.cedula) OR
       (OLD.nombres IS DISTINCT FROM NEW.nombres) OR
       (OLD.apellidos IS DISTINCT FROM NEW.apellidos) OR
       (OLD.fecha_nac IS DISTINCT FROM NEW.fecha_nac) OR
       (OLD.sexo IS DISTINCT FROM NEW.sexo) OR
       (OLD.tipo_beneficiario IS DISTINCT FROM NEW.tipo_beneficiario) OR
       (OLD.parentesco IS DISTINCT FROM NEW.parentesco) THEN
       
        INSERT INTO auditoria_actualizacion_beneficiarios (
            num_beneficiario, id_caso,
            cedula_anterior, nombres_anterior, apellidos_anterior, fecha_nacimiento_anterior, sexo_anterior, tipo_beneficiario_anterior, parentesco_anterior,
            cedula_nuevo, nombres_nuevo, apellidos_nuevo, fecha_nacimiento_nuevo, sexo_nuevo, tipo_beneficiario_nuevo, parentesco_nuevo,
            id_usuario_actualizo
        ) VALUES (
            NEW.num_beneficiario, NEW.id_caso,
            OLD.cedula, OLD.nombres, OLD.apellidos, OLD.fecha_nac, OLD.sexo, OLD.tipo_beneficiario, OLD.parentesco,
            NEW.cedula, NEW.nombres, NEW.apellidos, NEW.fecha_nac, NEW.sexo, NEW.tipo_beneficiario, NEW.parentesco,
            COALESCE(NEW.id_usuario_actualizo, v_usuario)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
