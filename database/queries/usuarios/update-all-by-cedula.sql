-- Actualizar toda la información de un usuario (igual que update-all.sql) pero filtrando por cédula
CREATE OR REPLACE PROCEDURE update_all_by_cedula(
    p_cedula                VARCHAR,
    p_nombres               VARCHAR DEFAULT NULL,
    p_apellidos             VARCHAR DEFAULT NULL,
    p_correo_electronico    VARCHAR DEFAULT NULL,
    p_nombre_usuario        VARCHAR DEFAULT NULL,
    p_telefono_celular      VARCHAR DEFAULT NULL,
    p_tipo_usuario          VARCHAR DEFAULT NULL,
    -- Estudiante
    p_estudiante_nrc        VARCHAR DEFAULT NULL,
    p_estudiante_term       VARCHAR DEFAULT NULL,
    p_estudiante_tipo       VARCHAR DEFAULT NULL,
    -- Profesor
    p_profesor_term         VARCHAR DEFAULT NULL,
    p_profesor_tipo         VARCHAR DEFAULT NULL,
    -- Coordinador
    p_coordinador_term      VARCHAR DEFAULT NULL,
    p_cedula_actor          VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
    DECLARE
        v_tipo_usuario_anterior VARCHAR;
    BEGIN
        SELECT tipo_usuario INTO v_tipo_usuario_anterior FROM usuarios WHERE cedula = p_cedula;

        -- Actualizar tabla usuarios solo si existe el usuario
        UPDATE usuarios
        SET 
            nombres = COALESCE(p_nombres, nombres), 
            apellidos = COALESCE(p_apellidos, apellidos), 
            correo_electronico = COALESCE(p_correo_electronico, correo_electronico), 
            nombre_usuario = COALESCE(p_nombre_usuario, nombre_usuario),
            telefono_celular = COALESCE(p_telefono_celular, telefono_celular),
            tipo_usuario = COALESCE(p_tipo_usuario, tipo_usuario)
        WHERE cedula = p_cedula;

        -- Auditoría y manejo de cambio de tipo_usuario
        IF p_tipo_usuario IS NOT NULL AND v_tipo_usuario_anterior IS DISTINCT FROM p_tipo_usuario THEN
            INSERT INTO auditoria_actualizacion_tipo_usuario (
                ci_usuario, tipo_usuario_anterior, tipo_usuario_nuevo, actualizado_por
            ) VALUES (
                p_cedula,
                v_tipo_usuario_anterior,
                p_tipo_usuario,
                p_cedula_actor
            );

            -- Eliminar de la tabla anterior si cambió de tipo
            IF v_tipo_usuario_anterior = 'Estudiante' THEN
                -- Eliminar dependencias para evitar FK violation
                DELETE FROM se_le_asigna WHERE cedula_estudiante = p_cedula;
                DELETE FROM estudiantes WHERE cedula_estudiante = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Profesor' THEN
                -- Eliminar dependencias para evitar FK violation
                DELETE FROM supervisa WHERE cedula_profesor = p_cedula;
                DELETE FROM profesores WHERE cedula_profesor = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Coordinador' THEN
                DELETE FROM coordinadores WHERE id_coordinador = p_cedula;
            END IF;

            -- Insertar en la nueva tabla según el tipo
            IF p_tipo_usuario = 'Estudiante' THEN
                INSERT INTO estudiantes (cedula_estudiante, nrc, term, tipo_estudiante)
                VALUES (p_cedula, p_estudiante_nrc, p_estudiante_term, p_estudiante_tipo);
            ELSIF p_tipo_usuario = 'Profesor' THEN
                INSERT INTO profesores (cedula_profesor, term, tipo_profesor)
                VALUES (p_cedula, p_profesor_term, p_profesor_tipo);
            ELSIF p_tipo_usuario = 'Coordinador' THEN
                INSERT INTO coordinadores (id_coordinador, term)
                VALUES (p_cedula, p_coordinador_term);
            END IF;

        ELSE
            -- Si el tipo no cambió, solo actualiza en la tabla correspondiente
            IF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Estudiante' THEN
                UPDATE estudiantes
                SET 
                    nrc = COALESCE(p_estudiante_nrc, nrc),
                    term = COALESCE(p_estudiante_term, term),
                    tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante)
                WHERE cedula_estudiante = p_cedula;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Profesor' THEN
                UPDATE profesores
                SET 
                    term = COALESCE(p_profesor_term, term),
                    tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor)
                WHERE cedula_profesor = p_cedula;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Coordinador' THEN
                UPDATE coordinadores
                SET 
                    term = COALESCE(p_coordinador_term, term)
                WHERE id_coordinador = p_cedula;
            END IF;
        END IF;
    END;
$$;