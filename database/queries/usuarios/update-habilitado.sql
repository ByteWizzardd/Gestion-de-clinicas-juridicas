CREATE OR REPLACE FUNCTION toggle_habilitado_usuario(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_habilitado_anterior BOOLEAN;
    v_habilitado_nuevo BOOLEAN;
    v_nombres_anterior VARCHAR;
    v_apellidos_anterior VARCHAR;
    v_correo_electronico_anterior VARCHAR;
    v_nombre_usuario_anterior VARCHAR;
    v_telefono_celular_anterior VARCHAR;
    v_tipo_usuario_anterior VARCHAR;
    v_tipo_estudiante_anterior VARCHAR;
    v_tipo_profesor_anterior VARCHAR;
BEGIN
    -- Obtener valores anteriores
    SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
    INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_anterior, v_tipo_usuario_anterior
    FROM usuarios WHERE cedula = p_cedula_usuario;

    -- Obtener tipo_estudiante anterior si aplica
    IF v_tipo_usuario_anterior = 'Estudiante' THEN
        SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario AND habilitado = TRUE;
    END IF;
    
    -- Obtener tipo_profesor anterior si aplica
    IF v_tipo_usuario_anterior = 'Profesor' THEN
        SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula_usuario AND habilitado = TRUE;
    END IF;

    -- Actualizar habilitado_sistema
    UPDATE usuarios
    SET habilitado_sistema = NOT habilitado_sistema
    WHERE cedula = p_cedula_usuario;

    -- Obtener el nuevo valor
    SELECT habilitado_sistema INTO v_habilitado_nuevo FROM usuarios WHERE cedula = p_cedula_usuario;

    -- SI SE ESTÁ DESHABILITANDO, TAMBIÉN REGISTRAR EN LA TABLA DE ELIMINADOS (AHORA DESHABILITADOS)
    IF v_habilitado_nuevo = FALSE AND p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        INSERT INTO auditoria_eliminacion_usuario (
            usuario_eliminado,
            nombres_usuario_eliminado,
            apellidos_usuario_eliminado,
            eliminado_por,
            motivo,
            fecha
        ) VALUES (
            p_cedula_usuario,
            v_nombres_anterior,
            v_apellidos_anterior,
            p_cedula_actor,
            'Deshabilitación individual del sistema',
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;

    -- SI SE ESTÁ HABILITANDO NUEVAMENTE, REGISTRAR EN LA TABLA DE HABILITACIÓN
    IF v_habilitado_nuevo = TRUE AND v_habilitado_anterior = FALSE AND p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        INSERT INTO auditoria_habilitacion_usuario (
            usuario_habilitado,
            nombres_usuario_habilitado,
            apellidos_usuario_habilitado,
            habilitado_por,
            motivo,
            fecha
        ) VALUES (
            p_cedula_usuario,
            v_nombres_anterior,
            v_apellidos_anterior,
            p_cedula_actor,
            'Reactivación individual del sistema',
            (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
