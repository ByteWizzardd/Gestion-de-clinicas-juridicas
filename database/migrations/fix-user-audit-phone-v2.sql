-- Actualizar el procedimiento almacenado para manejar cadenas vacías como NULL para el teléfono
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
        -- Valores anteriores de la tabla usuarios
        v_nombres_anterior VARCHAR;
        v_apellidos_anterior VARCHAR;
        v_correo_electronico_anterior VARCHAR;
        v_nombre_usuario_anterior VARCHAR;
        v_telefono_celular_anterior VARCHAR;
        v_habilitado_sistema_anterior BOOLEAN;
        v_tipo_usuario_anterior VARCHAR;
        -- Valores anteriores de estudiante/profesor
        v_tipo_estudiante_anterior VARCHAR;
        v_tipo_profesor_anterior VARCHAR;
        -- Valores nuevos (después de actualizar)
        v_tipo_estudiante_nuevo VARCHAR;
        v_tipo_profesor_nuevo VARCHAR;
        -- Flags para detectar cambios
        v_hubo_cambios BOOLEAN := FALSE;
    BEGIN
        -- Obtener valores anteriores de la tabla usuarios
        SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
        INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_sistema_anterior, v_tipo_usuario_anterior
        FROM usuarios WHERE cedula = p_cedula;

        -- Obtener tipo_estudiante anterior si aplica
        IF v_tipo_usuario_anterior = 'Estudiante' THEN
            SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula AND habilitado = TRUE;
        END IF;
        
        -- Obtener tipo_profesor anterior si aplica
        IF v_tipo_usuario_anterior = 'Profesor' THEN
            SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula AND habilitado = TRUE;
        END IF;

        -- Actualizar tabla usuarios solo si existe el usuario
        UPDATE usuarios
        SET 
            nombres = COALESCE(p_nombres, nombres), 
            apellidos = COALESCE(p_apellidos, apellidos), 
            correo_electronico = COALESCE(p_correo_electronico, correo_electronico), 
            nombre_usuario = COALESCE(p_nombre_usuario, nombre_usuario),
            -- Si p_telefono_celular es '', establecer a NULL. Si es NULL, mantener valor anterior. Si tiene valor, actualizar.
            telefono_celular = CASE 
                                    WHEN p_telefono_celular = '' THEN NULL 
                                    ELSE COALESCE(p_telefono_celular, telefono_celular) 
                               END,
            tipo_usuario = COALESCE(p_tipo_usuario, tipo_usuario)
        WHERE cedula = p_cedula;

        -- Manejo de cambio de tipo_usuario
        IF p_tipo_usuario IS NOT NULL AND v_tipo_usuario_anterior IS DISTINCT FROM p_tipo_usuario THEN
            -- Deshabilitar en la tabla anterior
            IF v_tipo_usuario_anterior = 'Estudiante' THEN
                UPDATE estudiantes
                SET habilitado = FALSE
                WHERE cedula_estudiante = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Profesor' THEN
                UPDATE profesores
                SET habilitado = FALSE
                WHERE cedula_profesor = p_cedula;
            ELSIF v_tipo_usuario_anterior = 'Coordinador' THEN
                UPDATE coordinadores
                SET habilitado = FALSE      
                WHERE id_coordinador = p_cedula;
            END IF;

            -- Insertar o actualizar en la nueva tabla según el tipo
            IF p_tipo_usuario = 'Estudiante' THEN
                IF EXISTS (SELECT 1 FROM estudiantes WHERE cedula_estudiante = p_cedula) THEN
                    UPDATE estudiantes
                    SET nrc = COALESCE(p_estudiante_nrc, nrc),
                        term = COALESCE(p_estudiante_term, term),
                        tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante),
                        habilitado = TRUE
                    WHERE cedula_estudiante = p_cedula;
                ELSE
                    INSERT INTO estudiantes (cedula_estudiante, nrc, term, tipo_estudiante, habilitado)
                    VALUES (p_cedula, p_estudiante_nrc, p_estudiante_term, p_estudiante_tipo, TRUE);
                END IF;
                v_tipo_estudiante_nuevo := p_estudiante_tipo;
            ELSIF p_tipo_usuario = 'Profesor' THEN
                IF EXISTS (SELECT 1 FROM profesores WHERE cedula_profesor = p_cedula) THEN
                    UPDATE profesores
                    SET term = COALESCE(p_profesor_term, term),
                        tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor),
                        habilitado = TRUE
                    WHERE cedula_profesor = p_cedula;
                ELSE
                    INSERT INTO profesores (cedula_profesor, term, tipo_profesor, habilitado)
                    VALUES (p_cedula, p_profesor_term, p_profesor_tipo, TRUE);
                END IF;
                v_tipo_profesor_nuevo := p_profesor_tipo;
            ELSIF p_tipo_usuario = 'Coordinador' THEN
                IF EXISTS (SELECT 1 FROM coordinadores WHERE id_coordinador = p_cedula) THEN
                    UPDATE coordinadores
                    SET term = COALESCE(p_coordinador_term, term),
                        habilitado = TRUE
                    WHERE id_coordinador = p_cedula;
                ELSE
                    INSERT INTO coordinadores (id_coordinador, term, habilitado)
                    VALUES (p_cedula, p_coordinador_term, TRUE);
                END IF;
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
                -- Obtener el valor nuevo después de actualizar
                SELECT tipo_estudiante INTO v_tipo_estudiante_nuevo FROM estudiantes WHERE cedula_estudiante = p_cedula AND habilitado = TRUE;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Profesor' THEN
                UPDATE profesores
                SET 
                    term = COALESCE(p_profesor_term, term),
                    tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor)
                WHERE cedula_profesor = p_cedula;
                -- Obtener el valor nuevo después de actualizar
                SELECT tipo_profesor INTO v_tipo_profesor_nuevo FROM profesores WHERE cedula_profesor = p_cedula AND habilitado = TRUE;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Coordinador' THEN
                UPDATE coordinadores
                SET 
                    term = COALESCE(p_coordinador_term, term)
                WHERE id_coordinador = p_cedula;
            END IF;
        END IF;

        -- Obtener los valores ACTUALIZADOS para comparar (importante para detectar cambio a NULL)
        -- No podemos confiar solo en p_telefono_celular porque podría ser '' o NULL o valor.
        -- Mejor consultar el valor actual en base de datos post-update para verificar el cambio real.
        -- O simplemente usar la lógica de comparación directa con el tratamiento especial de ''
        
        DECLARE
           v_telefono_celular_actualizado VARCHAR;
        BEGIN
            SELECT telefono_celular INTO v_telefono_celular_actualizado FROM usuarios WHERE cedula = p_cedula;
            
             -- Detectar si hubo cambios en cualquier campo
            IF (v_nombres_anterior IS DISTINCT FROM COALESCE(p_nombres, v_nombres_anterior)) OR
               (v_apellidos_anterior IS DISTINCT FROM COALESCE(p_apellidos, v_apellidos_anterior)) OR
               (v_correo_electronico_anterior IS DISTINCT FROM COALESCE(p_correo_electronico, v_correo_electronico_anterior)) OR
               (v_nombre_usuario_anterior IS DISTINCT FROM COALESCE(p_nombre_usuario, v_nombre_usuario_anterior)) OR
               (v_telefono_celular_anterior IS DISTINCT FROM v_telefono_celular_actualizado) OR -- Usar el valor realmente persistido
               (v_habilitado_sistema_anterior IS DISTINCT FROM v_habilitado_sistema_anterior) OR 
               (v_tipo_usuario_anterior IS DISTINCT FROM COALESCE(p_tipo_usuario, v_tipo_usuario_anterior)) OR
               (v_tipo_estudiante_anterior IS DISTINCT FROM v_tipo_estudiante_nuevo) OR
               (v_tipo_profesor_anterior IS DISTINCT FROM v_tipo_profesor_nuevo) THEN
                v_hubo_cambios := TRUE;
            END IF;

            -- Insertar auditoría manual si hubo cambios y hay actor
            IF v_hubo_cambios AND p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
                INSERT INTO auditoria_actualizacion_usuarios (
                    ci_usuario,
                    nombres_anterior,
                    apellidos_anterior,
                    correo_electronico_anterior,
                    nombre_usuario_anterior,
                    telefono_celular_anterior,
                    habilitado_sistema_anterior,
                    tipo_usuario_anterior,
                    tipo_estudiante_anterior,
                    tipo_profesor_anterior,
                    nombres_nuevo,
                    apellidos_nuevo,
                    correo_electronico_nuevo,
                    nombre_usuario_nuevo,
                    telefono_celular_nuevo,
                    habilitado_sistema_nuevo,
                    tipo_usuario_nuevo,
                    tipo_estudiante_nuevo,
                    tipo_profesor_nuevo,
                    id_usuario_actualizo,
                    fecha_actualizacion
                ) VALUES (
                    p_cedula,
                    v_nombres_anterior,
                    v_apellidos_anterior,
                    v_correo_electronico_anterior,
                    v_nombre_usuario_anterior,
                    v_telefono_celular_anterior,
                    v_habilitado_sistema_anterior,
                    v_tipo_usuario_anterior,
                    v_tipo_estudiante_anterior,
                    v_tipo_profesor_anterior,
                    COALESCE(p_nombres, v_nombres_anterior),
                    COALESCE(p_apellidos, v_apellidos_anterior),
                    COALESCE(p_correo_electronico, v_correo_electronico_anterior),
                    COALESCE(p_nombre_usuario, v_nombre_usuario_anterior),
                    v_telefono_celular_actualizado, -- Usar el valor real actualizado
                    v_habilitado_sistema_anterior, 
                    COALESCE(p_tipo_usuario, v_tipo_usuario_anterior),
                    v_tipo_estudiante_nuevo,
                    v_tipo_profesor_nuevo,
                    p_cedula_actor,
                    (NOW() AT TIME ZONE 'America/Caracas')
                );
            END IF;
        END;
    END;
$$;
