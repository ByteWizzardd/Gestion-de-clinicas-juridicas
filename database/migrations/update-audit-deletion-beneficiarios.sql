-- Agregar campos faltantes a la tabla de auditoría de eliminación de beneficiarios
ALTER TABLE auditoria_eliminacion_beneficiarios
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS sexo VARCHAR(20),
ADD COLUMN IF NOT EXISTS tipo_beneficiario VARCHAR(20),
ADD COLUMN IF NOT EXISTS parentesco VARCHAR(50);

-- Actualizar trigger para capturar estos datos al eliminar
CREATE OR REPLACE FUNCTION trigger_auditoria_eliminacion_beneficiario()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario VARCHAR(20);
BEGIN
    BEGIN
        v_usuario := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
        v_usuario := NULL;
    END;
    
    INSERT INTO auditoria_eliminacion_beneficiarios (
        num_beneficiario, cedula, nombres, apellidos, id_caso, id_usuario_elimino,
        fecha_nacimiento, sexo, tipo_beneficiario, parentesco
    ) VALUES (
        OLD.num_beneficiario, OLD.cedula, OLD.nombres, OLD.apellidos, OLD.id_caso, v_usuario,
        OLD.fecha_nac, OLD.sexo, OLD.tipo_beneficiario, OLD.parentesco
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
