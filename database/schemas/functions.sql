-- =========================================================
-- FUNCIONES DE BASE DE DATOS
-- Este archivo debe ejecutarse ANTES de roles_permissions.sql
-- =========================================================

-- =========================================================
-- FUNCION: eliminar_caso_fisico
-- Elimina físicamente un caso y todas sus referencias asociadas.
-- Parámetros:
--   p_id_caso INTEGER: ID del caso a eliminar
--   p_cedula_actor VARCHAR(20): Usuario que realiza la acción
--   p_motivo TEXT: Motivo de la eliminación (obligatorio)
--

CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
    v_ejecutores_json JSONB;
BEGIN
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de casos';
    END IF;

    -- Verificar existencia del caso
    IF NOT EXISTS (SELECT 1 FROM casos WHERE id_caso = p_id_caso) THEN
        RAISE EXCEPTION 'El caso con ID % no existe', p_id_caso;
    END IF;

    -- Construir motivo para entidades relacionadas
    v_motivo_relacionados := p_motivo || ' (Eliminado por eliminación del caso #' || p_id_caso || ')';
    
    -- =========================================================
    -- Capturar ejecutores de todas las acciones del caso ANTES de eliminarlos
    -- Incluye:
    --   - ejecutores_texto: String con nombres concatenados
    --   - fecha_ejecucion: Primera fecha de ejecución
    --   - ejecutores_detalle: Array JSON con datos de cada ejecutor
    -- =========================================================
    SELECT COALESCE(jsonb_object_agg(
        e.num_accion::text,
        jsonb_build_object(
            'ejecutores_texto', (
                SELECT string_agg(u.nombres || ' ' || u.apellidos, ', ')
                FROM ejecutan e2
                JOIN usuarios u ON e2.id_usuario_ejecuta = u.cedula
                WHERE e2.num_accion = e.num_accion AND e2.id_caso = e.id_caso
            ),
            'fecha_ejecucion', (
                SELECT MIN(e3.fecha_ejecucion)
                FROM ejecutan e3
                WHERE e3.num_accion = e.num_accion AND e3.id_caso = e.id_caso
            ),
            'ejecutores_detalle', (
                SELECT jsonb_agg(jsonb_build_object(
                    'cedula', e4.id_usuario_ejecuta,
                    'nombres', u2.nombres,
                    'apellidos', u2.apellidos,
                    'fecha', e4.fecha_ejecucion
                ))
                FROM ejecutan e4
                JOIN usuarios u2 ON e4.id_usuario_ejecuta = u2.cedula
                WHERE e4.num_accion = e.num_accion AND e4.id_caso = e.id_caso
            )
        )
    ), '{}'::jsonb)
    INTO v_ejecutores_json
    FROM (SELECT DISTINCT num_accion, id_caso FROM ejecutan WHERE id_caso = p_id_caso) e;

    BEGIN
        -- =========================================================
        -- Establecer variables de sesión para TODOS los triggers de auditoría
        -- =========================================================
        
        -- Variables para auditoría de CASOS (usa motivo original)
        PERFORM set_config('app.usuario_elimina_caso', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_caso', p_motivo, true);
        
        -- Variables para auditoría de CITAS (usa motivo con contexto)
        PERFORM set_config('app.usuario_elimina_cita', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_cita', v_motivo_relacionados, true);
        
        -- Variables para auditoría de BENEFICIARIOS
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_beneficiario', v_motivo_relacionados, true);
        
        -- Variables para auditoría de ACCIONES (incluyendo ejecutores pre-capturados)
        PERFORM set_config('app.usuario_elimina_accion', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_accion', v_motivo_relacionados, true);
        PERFORM set_config('app.ejecutores_acciones_json', v_ejecutores_json::text, true);
        
        -- Variables para auditoría de SOPORTES
        PERFORM set_config('app.usuario_elimina_soporte', p_cedula_actor, true);
        PERFORM set_config('app.motivo_eliminacion_soporte', v_motivo_relacionados, true);

        -- =========================================================
        -- Eliminar referencias en orden inverso de dependencias
        -- =========================================================
        
        -- 1. Eliminar ejecutores (depende de acciones)
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;
        
        -- 2. Eliminar acciones (depende de casos) - trigger lee ejecutores del JSON
        DELETE FROM acciones WHERE id_caso = p_id_caso;
        
        -- 3. Eliminar atienden (depende de citas)
        DELETE FROM atienden WHERE id_caso = p_id_caso;
        
        -- 4. Eliminar citas (depende de casos)
        DELETE FROM citas WHERE id_caso = p_id_caso;
        
        -- 5. Eliminar cambios de estatus (depende de casos)
        DELETE FROM cambio_estatus WHERE id_caso = p_id_caso;
        
        -- 6. Eliminar soportes (depende de casos)
        DELETE FROM soportes WHERE id_caso = p_id_caso;
        
        -- 7. Eliminar beneficiarios (depende de casos)
        DELETE FROM beneficiarios WHERE id_caso = p_id_caso;
        
        -- 8. Eliminar supervisa (depende de casos)
        DELETE FROM supervisa WHERE id_caso = p_id_caso;
        
        -- 9. Eliminar se_le_asigna (depende de casos)
        DELETE FROM se_le_asigna WHERE id_caso = p_id_caso;

        -- 10. Eliminar el caso (el trigger registrará la auditoría antes de eliminar)
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- FUNCION: eliminar_usuario_fisico
-- Elimina físicamente un usuario y todas sus referencias asociadas.
-- Parámetros:
--   p_cedula_usuario VARCHAR(20): Usuario a eliminar
--   p_cedula_actor   VARCHAR(20): Usuario que realiza la acción
--   p_motivo         TEXT: Motivo de la eliminación (obligatorio)
--

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
    -- Validar motivo
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de usuarios';
    END IF;

    -- Verificar existencia del usuario y obtener sus datos
    SELECT nombres, apellidos INTO STRICT v_nombres_usuario, v_apellidos_usuario
    FROM usuarios 
    WHERE cedula = p_cedula_usuario;

    -- Contar casos y acciones asociadas para mostrarlos al usuario
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
        -- Eliminar referencias operativas (no de auditoría)
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
        
        -- Actualizar referencias en citas
        UPDATE citas SET id_usuario_registro = NULL WHERE id_usuario_registro = p_cedula_usuario;
        UPDATE citas SET id_usuario_actualizo = NULL WHERE id_usuario_actualizo = p_cedula_usuario;
        
        -- Actualizar referencias en soportes
        UPDATE soportes SET id_usuario_subio = NULL WHERE id_usuario_subio = p_cedula_usuario;


        -- Auditoría de eliminación (guardar antes de eliminar)
        INSERT INTO auditoria_eliminacion_usuario (
            usuario_eliminado, 
            nombres_usuario_eliminado,
            apellidos_usuario_eliminado,
            eliminado_por, 
            motivo, 
            fecha
        ) VALUES (
            p_cedula_usuario,
            v_nombres_usuario,
            v_apellidos_usuario,
            p_cedula_actor,
            p_motivo,
            (NOW() AT TIME ZONE 'America/Caracas')
        );

        -- Eliminar de usuarios (después de guardar la auditoría)
        -- Las foreign keys de auditoría deben permitir la eliminación (ON DELETE SET NULL)
        DELETE FROM usuarios WHERE cedula = p_cedula_usuario;

    EXCEPTION
        WHEN foreign_key_violation THEN
            -- Obtener más detalles sobre qué foreign key está causando el problema
            RAISE EXCEPTION 'No se puede eliminar el usuario porque aún tiene referencias activas en tablas operativas. Detalle: %. Use disable.sql (Soft Delete) en su lugar.', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar usuario: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- FUNCION: toggle_habilitado_usuario
-- Habilita o deshabilita un usuario y registra en auditoría.
-- Parámetros:
--   p_cedula_usuario VARCHAR(20): Usuario a modificar
--   p_cedula_actor   VARCHAR(20): Usuario que realiza la acción
--

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

    -- REGISTRAR CUALQUIER CAMBIO DE ESTADO EN AUDITORIA DE ACTUALIZACIÓN
    IF v_habilitado_nuevo != v_habilitado_anterior AND p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        INSERT INTO auditoria_actualizacion_usuarios (
            ci_usuario,
            -- Valores anteriores
            nombres_anterior, apellidos_anterior, correo_electronico_anterior, nombre_usuario_anterior, telefono_celular_anterior,
            habilitado_sistema_anterior, tipo_usuario_anterior, tipo_estudiante_anterior, tipo_profesor_anterior,
            -- Valores nuevos (se mantienen igual excepto el estado)
            nombres_nuevo, apellidos_nuevo, correo_electronico_nuevo, nombre_usuario_nuevo, telefono_celular_nuevo,
            habilitado_sistema_nuevo, tipo_usuario_nuevo, tipo_estudiante_nuevo, tipo_profesor_nuevo,
            -- Metadatos
            id_usuario_actualizo, fecha_actualizacion
        ) VALUES (
            p_cedula_usuario,
            -- Anteriores
            v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior,
            v_habilitado_anterior, v_tipo_usuario_anterior, v_tipo_estudiante_anterior, v_tipo_profesor_anterior,
            -- Nuevos
            v_nombres_anterior, v_apellidos_anterior, v_correo_electronico_anterior, v_nombre_usuario_anterior, v_telefono_celular_anterior,
            v_habilitado_nuevo, v_tipo_usuario_anterior, v_tipo_estudiante_anterior, v_tipo_profesor_anterior,
            -- Metadatos
            p_cedula_actor, (NOW() AT TIME ZONE 'America/Caracas')
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
