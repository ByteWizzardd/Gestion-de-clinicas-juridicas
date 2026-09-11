-- =============================================================================
-- Fix: 3 funciones de usuarios seguian haciendo INSERT manual en tablas de
-- auditoria por-entidad que ya no existen (auditoria_actualizacion_usuarios,
-- auditoria_eliminacion_usuario) -- exactamente el punto pendiente de
-- plan-backend-auditoria.md §4 ("3 stored procedures... simplificar: agregar
-- set_config('app.current_user_id', ...) y borrar su INSERT INTO auditoria_*
-- manual"), que quedaba en schema.sql pero nunca se desplegó del todo:
--
-- - toggle_habilitado_usuario(cedula, cedula_actor): el overload de 2
--   parametros (el que usa lib/db/queries/usuarios.queries.ts) insertaba en
--   auditoria_actualizacion_usuarios -> "relation does not exist" cada vez
--   que alguien habilita/deshabilita un usuario y el estado realmente
--   cambia. Bloqueaba esa funcion completa.
-- - eliminar_usuario_fisico: insertaba en auditoria_eliminacion_usuario ->
--   misma falla, bloqueaba la eliminacion fisica de usuarios.
-- - update_all_by_cedula: insertaba en auditoria_actualizacion_usuarios si
--   detectaba cambios -> bloqueaba CUALQUIER edicion de usuario que
--   cambiara nombre/correo/telefono/tipo/etc.
--
-- Importante: la version desplegada en Neon de update_all_by_cedula tenia
-- una mejora real que schema.sql NO tenia todavia (escopar las tablas
-- estudiantes/profesores/coordinadores al semestre actual -- v_term_actual
-- -- en vez de actualizar cualquier fila con esa cedula sin importar el
-- term). Esta migracion preserva esa mejora y solo quita el INSERT roto,
-- agregando el set_config que ya usan las otras dos funciones. schema.sql
-- se actualiza para reflejar exactamente esta version fusionada.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260911_030000_simplificar_auditoria_manual_usuarios.sql
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1) toggle_habilitado_usuario (2 args)
-- -----------------------------------------------------------------------
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
    SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
    INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_anterior, v_tipo_usuario_anterior
    FROM usuarios WHERE cedula = p_cedula_usuario;

    IF v_tipo_usuario_anterior = 'Estudiante' THEN
        SELECT tipo_estudiante INTO v_tipo_estudiante_anterior FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario AND habilitado = TRUE;
    END IF;

    IF v_tipo_usuario_anterior = 'Profesor' THEN
        SELECT tipo_profesor INTO v_tipo_profesor_anterior FROM profesores WHERE cedula_profesor = p_cedula_usuario AND habilitado = TRUE;
    END IF;

    -- Auditoría: la captura el trigger genérico sobre `usuarios`.
    IF p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
    END IF;

    UPDATE usuarios
    SET habilitado_sistema = NOT habilitado_sistema
    WHERE cedula = p_cedula_usuario;

    SELECT habilitado_sistema INTO v_habilitado_nuevo FROM usuarios WHERE cedula = p_cedula_usuario;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------
-- 2) eliminar_usuario_fisico
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION eliminar_usuario_fisico(
    p_cedula_usuario VARCHAR,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    casos_count INTEGER;
    acciones_count INTEGER;
    v_nombres_usuario VARCHAR(100);
    v_apellidos_usuario VARCHAR(100);
BEGIN
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de usuarios';
    END IF;

    SELECT nombres, apellidos INTO STRICT v_nombres_usuario, v_apellidos_usuario
    FROM usuarios
    WHERE cedula = p_cedula_usuario;

    SELECT COUNT(*) INTO casos_count FROM (
        SELECT 1 FROM casos c INNER JOIN supervisa s ON c.id_caso = s.id_caso WHERE s.cedula_profesor = p_cedula_usuario
        UNION ALL
        SELECT 1 FROM casos c INNER JOIN se_le_asigna sla ON c.id_caso = sla.id_caso WHERE sla.cedula_estudiante = p_cedula_usuario
    ) t;

    SELECT COUNT(*) INTO acciones_count FROM acciones WHERE id_usuario_registra = p_cedula_usuario;

    IF casos_count > 0 OR acciones_count > 0 THEN
        RAISE WARNING 'Este usuario tiene % caso(s) y % acción(es) asociados. Esta información se perderá.', casos_count, acciones_count;
    END IF;

    BEGIN
        DELETE FROM password_reset_tokens WHERE cedula_usuario = p_cedula_usuario;
        DELETE FROM atienden WHERE id_usuario = p_cedula_usuario;
        DELETE FROM ejecutan WHERE id_usuario_ejecuta = p_cedula_usuario;
        DELETE FROM supervisa WHERE cedula_profesor = p_cedula_usuario;
        DELETE FROM se_le_asigna WHERE cedula_estudiante = p_cedula_usuario;
        UPDATE acciones SET id_usuario_registra = NULL WHERE id_usuario_registra = p_cedula_usuario;
        UPDATE cambio_estatus SET id_usuario_cambia = NULL WHERE id_usuario_cambia = p_cedula_usuario;
        DELETE FROM coordinadores WHERE id_coordinador = p_cedula_usuario;
        DELETE FROM estudiantes WHERE cedula_estudiante = p_cedula_usuario;
        DELETE FROM profesores WHERE cedula_profesor = p_cedula_usuario;

        UPDATE citas SET id_usuario_registro = NULL WHERE id_usuario_registro = p_cedula_usuario;
        UPDATE soportes SET id_usuario_subio = NULL WHERE id_usuario_subio = p_cedula_usuario;

        -- Auditoría: la captura el trigger genérico sobre `usuarios`, que lee
        -- el actor de app.current_user_id y el motivo de app.audit_metadata.
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', p_motivo)::text, true);

        DELETE FROM usuarios WHERE cedula = p_cedula_usuario;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el usuario porque aún tiene referencias activas en tablas operativas. Detalle: %. Use disable.sql (Soft Delete) en su lugar.', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------
-- 3) update_all_by_cedula (preserva el escopado por term_actual que ya
--    tenía la versión desplegada; solo quita el INSERT manual roto)
-- -----------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE update_all_by_cedula(
    p_cedula                VARCHAR,
    p_nombres               VARCHAR DEFAULT NULL,
    p_apellidos             VARCHAR DEFAULT NULL,
    p_correo_electronico    VARCHAR DEFAULT NULL,
    p_nombre_usuario        VARCHAR DEFAULT NULL,
    p_telefono_celular      VARCHAR DEFAULT NULL,
    p_tipo_usuario          VARCHAR DEFAULT NULL,
    p_estudiante_nrc        VARCHAR DEFAULT NULL,
    p_estudiante_term       VARCHAR DEFAULT NULL,
    p_estudiante_tipo       VARCHAR DEFAULT NULL,
    p_profesor_term         VARCHAR DEFAULT NULL,
    p_profesor_tipo         VARCHAR DEFAULT NULL,
    p_coordinador_term      VARCHAR DEFAULT NULL,
    p_cedula_actor          VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
    DECLARE
        v_nombres_anterior VARCHAR;
        v_apellidos_anterior VARCHAR;
        v_correo_electronico_anterior VARCHAR;
        v_nombre_usuario_anterior VARCHAR;
        v_telefono_celular_anterior VARCHAR;
        v_habilitado_sistema_anterior BOOLEAN;
        v_tipo_usuario_anterior VARCHAR;
        v_tipo_estudiante_anterior VARCHAR;
        v_tipo_profesor_anterior VARCHAR;
        v_tipo_estudiante_nuevo VARCHAR;
        v_tipo_profesor_nuevo VARCHAR;
        v_term_actual VARCHAR;
    BEGIN
        SELECT term INTO v_term_actual
        FROM semestres
        WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
        ORDER BY term DESC
        LIMIT 1;

        SELECT nombres, apellidos, correo_electronico, nombre_usuario, telefono_celular, habilitado_sistema, tipo_usuario
        INTO v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior, v_habilitado_sistema_anterior, v_tipo_usuario_anterior
        FROM usuarios WHERE cedula = p_cedula;

        IF v_tipo_usuario_anterior = 'Estudiante' THEN
            SELECT tipo_estudiante INTO v_tipo_estudiante_anterior
            FROM estudiantes
            WHERE cedula_estudiante = p_cedula AND term = v_term_actual;
        END IF;

        IF v_tipo_usuario_anterior = 'Profesor' THEN
            SELECT tipo_profesor INTO v_tipo_profesor_anterior
            FROM profesores
            WHERE cedula_profesor = p_cedula AND term = v_term_actual;
        END IF;

        -- Auditoría de la actualización de `usuarios`: la captura el trigger
        -- genérico, que lee el actor de app.current_user_id.
        IF p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
            PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        END IF;

        UPDATE usuarios
        SET
            nombres = COALESCE(p_nombres, nombres),
            apellidos = COALESCE(p_apellidos, apellidos),
            correo_electronico = COALESCE(p_correo_electronico, correo_electronico),
            nombre_usuario = COALESCE(p_nombre_usuario, nombre_usuario),
            telefono_celular = COALESCE(p_telefono_celular, telefono_celular),
            tipo_usuario = COALESCE(p_tipo_usuario, tipo_usuario)
        WHERE cedula = p_cedula;

        IF p_tipo_usuario IS NOT NULL AND v_tipo_usuario_anterior IS DISTINCT FROM p_tipo_usuario THEN
            IF v_tipo_usuario_anterior = 'Estudiante' THEN
                UPDATE estudiantes
                SET habilitado = FALSE
                WHERE cedula_estudiante = p_cedula AND term = v_term_actual;
            ELSIF v_tipo_usuario_anterior = 'Profesor' THEN
                UPDATE profesores
                SET habilitado = FALSE
                WHERE cedula_profesor = p_cedula AND term = v_term_actual;
            ELSIF v_tipo_usuario_anterior = 'Coordinador' THEN
                UPDATE coordinadores
                SET habilitado = FALSE
                WHERE id_coordinador = p_cedula AND term = v_term_actual;
            END IF;

            IF p_tipo_usuario = 'Estudiante' THEN
                IF EXISTS (SELECT 1 FROM estudiantes WHERE cedula_estudiante = p_cedula AND term = v_term_actual) THEN
                    UPDATE estudiantes
                    SET nrc = COALESCE(p_estudiante_nrc, nrc),
                        tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante),
                        habilitado = TRUE
                    WHERE cedula_estudiante = p_cedula AND term = v_term_actual;
                ELSE
                    INSERT INTO estudiantes (cedula_estudiante, nrc, term, tipo_estudiante, habilitado)
                    VALUES (p_cedula, p_estudiante_nrc, v_term_actual, p_estudiante_tipo, TRUE);
                END IF;
                v_tipo_estudiante_nuevo := p_estudiante_tipo;
            ELSIF p_tipo_usuario = 'Profesor' THEN
                IF EXISTS (SELECT 1 FROM profesores WHERE cedula_profesor = p_cedula AND term = v_term_actual) THEN
                    UPDATE profesores
                    SET tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor),
                        habilitado = TRUE
                    WHERE cedula_profesor = p_cedula AND term = v_term_actual;
                ELSE
                    INSERT INTO profesores (cedula_profesor, term, tipo_profesor, habilitado)
                    VALUES (p_cedula, v_term_actual, p_profesor_tipo, TRUE);
                END IF;
                v_tipo_profesor_nuevo := p_profesor_tipo;
            ELSIF p_tipo_usuario = 'Coordinador' THEN
                IF EXISTS (SELECT 1 FROM coordinadores WHERE id_coordinador = p_cedula AND term = v_term_actual) THEN
                    UPDATE coordinadores
                    SET habilitado = TRUE
                    WHERE id_coordinador = p_cedula AND term = v_term_actual;
                ELSE
                    INSERT INTO coordinadores (id_coordinador, term, habilitado)
                    VALUES (p_cedula, v_term_actual, TRUE);
                END IF;
            END IF;

        ELSE
            IF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Estudiante' THEN
                UPDATE estudiantes
                SET
                    nrc = COALESCE(p_estudiante_nrc, nrc),
                    tipo_estudiante = COALESCE(p_estudiante_tipo, tipo_estudiante)
                WHERE cedula_estudiante = p_cedula AND term = v_term_actual;
                SELECT tipo_estudiante INTO v_tipo_estudiante_nuevo
                FROM estudiantes
                WHERE cedula_estudiante = p_cedula AND term = v_term_actual;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Profesor' THEN
                UPDATE profesores
                SET
                    tipo_profesor = COALESCE(p_profesor_tipo, tipo_profesor)
                WHERE cedula_profesor = p_cedula AND term = v_term_actual;
                SELECT tipo_profesor INTO v_tipo_profesor_nuevo
                FROM profesores
                WHERE cedula_profesor = p_cedula AND term = v_term_actual;
            ELSIF COALESCE(p_tipo_usuario, v_tipo_usuario_anterior) = 'Coordinador' THEN
                NULL;
            END IF;
        END IF;

        -- La auditoría de los cambios en `usuarios` ya quedó registrada por
        -- el trigger genérico al hacer el UPDATE de arriba.
    END;
$$;
