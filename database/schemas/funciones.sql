-- Funciones y procedimientos almacenados. Requiere schema.sql y vistas.sql.

CREATE OR REPLACE FUNCTION public.fn_auditoria_generica()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    v_usuario   VARCHAR(20);
    v_entidad   TEXT := TG_ARGV[0];
    v_pk_cols   TEXT[] := string_to_array(TG_ARGV[1], ',');
    -- Columnas cuyo valor nunca debe quedar en la auditoría.
    v_ocultas   TEXT[] := ARRAY['contrasena', 'documento_data'];
    v_old       JSONB; v_new JSONB;
    v_before    JSONB := '{}'::jsonb; v_after JSONB := '{}'::jsonb;
    v_key       TEXT; v_id_entidad TEXT;
BEGIN
    IF current_setting('app.skip_audit_trigger', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    v_usuario := NULLIF(current_setting('app.current_user_id', true), '');

    IF TG_OP = 'INSERT' THEN
        v_usuario := COALESCE(v_usuario, NULLIF(COALESCE(
            to_jsonb(NEW)->>'id_usuario_cambia',
            to_jsonb(NEW)->>'id_usuario_registro',
            to_jsonb(NEW)->>'id_usuario_subio'), ''));
        v_after := to_jsonb(NEW) - v_ocultas;
        v_id_entidad := (SELECT string_agg(to_jsonb(NEW)->>c, '-') FROM unnest(v_pk_cols) c);

        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_nuevos, metadata)
        VALUES (v_entidad, 'insercion', v_id_entidad, v_usuario, v_after, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);

    ELSIF TG_OP = 'DELETE' THEN
        v_before := to_jsonb(OLD) - v_ocultas;
        v_id_entidad := (SELECT string_agg(to_jsonb(OLD)->>c, '-') FROM unnest(v_pk_cols) c);

        INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        VALUES (v_entidad, 'eliminacion', v_id_entidad, v_usuario, v_before, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);

    ELSE -- UPDATE
        v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);

        FOR v_key IN SELECT key FROM jsonb_object_keys(v_new) key LOOP
            IF v_old->v_key IS DISTINCT FROM v_new->v_key THEN
                IF v_key = ANY(v_ocultas) THEN
                    v_before := v_before || jsonb_build_object(v_key, '[oculto]');
                    v_after  := v_after  || jsonb_build_object(v_key, '[oculto]');
                ELSE
                    v_before := v_before || jsonb_build_object(v_key, v_old->v_key);
                    v_after  := v_after  || jsonb_build_object(v_key, v_new->v_key);
                END IF;
            END IF;
        END LOOP;

        IF v_before <> '{}'::jsonb THEN
            v_id_entidad := (SELECT string_agg(v_new->>c, '-') FROM unnest(v_pk_cols) c);
            INSERT INTO auditoria_eventos(entidad, operacion, id_entidad, id_usuario, datos_anteriores, datos_nuevos, metadata)
            VALUES (v_entidad, 'actualizacion', v_id_entidad, v_usuario, v_before, v_after, NULLIF(current_setting('app.audit_metadata', true), '')::jsonb);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END; $function$;



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
    v_estatus_final TEXT;
    v_equipo JSONB;
    v_resumen JSONB;
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

    -- =========================================================
    -- Estado del caso al eliminarse, para su evento de auditoría: los cambios
    -- de estatus y el equipo (supervisa / se_le_asigna) no tienen trigger de
    -- eliminación, así que sin esto se perdían del historial.
    -- =========================================================
    SELECT nuevo_estatus INTO v_estatus_final
    FROM cambio_estatus WHERE id_caso = p_id_caso
    ORDER BY num_cambio DESC LIMIT 1;

    v_equipo := jsonb_build_object(
        'profesores', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('cedula', s.cedula_profesor, 'nombre', u.nombres || ' ' || u.apellidos, 'term', s.term)
                             ORDER BY s.term DESC, u.apellidos)
            FROM supervisa s JOIN usuarios u ON u.cedula = s.cedula_profesor
            WHERE s.id_caso = p_id_caso), '[]'::jsonb),
        'estudiantes', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('cedula', a.cedula_estudiante, 'nombre', u.nombres || ' ' || u.apellidos, 'term', a.term)
                             ORDER BY a.term DESC, u.apellidos)
            FROM se_le_asigna a JOIN usuarios u ON u.cedula = a.cedula_estudiante
            WHERE a.id_caso = p_id_caso), '[]'::jsonb)
    );

    v_resumen := jsonb_build_object(
        'citas', (SELECT count(*) FROM citas WHERE id_caso = p_id_caso),
        'acciones', (SELECT count(*) FROM acciones WHERE id_caso = p_id_caso),
        'beneficiarios', (SELECT count(*) FROM beneficiarios WHERE id_caso = p_id_caso),
        'soportes', (SELECT count(*) FROM soportes WHERE id_caso = p_id_caso),
        'cambios_estatus', (SELECT count(*) FROM cambio_estatus WHERE id_caso = p_id_caso)
    );

    BEGIN
        -- =========================================================
        -- Variables de sesión para el trigger genérico de auditoría: un solo
        -- actor y un solo motivo (con contexto) para toda la cascada de deletes.
        -- =========================================================
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', v_motivo_relacionados)::text, true);

        -- Registrar los ejecutores de cada acción como su propio evento de auditoría
        -- ANTES de borrarlos (una vez eliminado `ejecutan`, esta información se pierde).
        INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        SELECT
            'accion_ejecutores',
            'eliminacion',
            num_accion,
            p_cedula_actor,
            jsonb_build_object('ejecutores', detalle -> 'ejecutores_detalle'),
            jsonb_build_object('motivo', v_motivo_relacionados)
        FROM jsonb_each(v_ejecutores_json) AS t(num_accion, detalle);

        -- =========================================================
        -- Eliminar referencias en orden inverso de dependencias
        -- =========================================================

        -- 1. Eliminar ejecutores (depende de acciones)
        DELETE FROM ejecutan WHERE id_caso = p_id_caso;

        -- 2. Eliminar acciones (depende de casos)
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

        -- 10. Eliminar el caso. Su evento lleva el motivo tal como lo escribió el
        --     usuario (sin el "(Eliminado por eliminación del caso #N)" de las
        --     entidades relacionadas) y el estado del caso capturado arriba.
        PERFORM set_config('app.audit_metadata', jsonb_build_object(
            'motivo', p_motivo,
            'estatus_final', v_estatus_final,
            'equipo', v_equipo,
            'eliminados', v_resumen
        )::text, true);
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
        
        -- Actualizar referencias en soporte
        UPDATE soportes SET id_usuario_subio = NULL WHERE id_usuario_subio = p_cedula_usuario;



        -- Auditoría de eliminación: la captura el trigger genérico sobre `usuarios`,
        -- que lee el actor de app.current_user_id y el motivo de app.audit_metadata.
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', p_motivo)::text, true);

        -- Eliminar de usuarios (después de dejar seteadas las variables de auditoría)
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

    -- Auditoría de la actualización: la captura el trigger genérico sobre `usuarios`.
    IF p_cedula_actor IS NOT NULL AND p_cedula_actor != '' THEN
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
    END IF;

    -- Actualizar habilitado_sistema
    UPDATE usuarios
    SET habilitado_sistema = NOT habilitado_sistema
    WHERE cedula = p_cedula_usuario;

    -- Obtener el nuevo valor
    SELECT habilitado_sistema INTO v_habilitado_nuevo FROM usuarios WHERE cedula = p_cedula_usuario;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PROCEDIMIENTO: update_all_by_cedula
-- Actualiza toda la información de un usuario filtrando por cédula
-- Incluye auditoría manual para capturar cambios en tipo_estudiante y tipo_profesor
-- =============================================
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
        -- Todas las operaciones sobre estudiantes/profesores/coordinadores
        -- quedan escopadas al semestre actual, para no pisar/leer filas de
        -- otros semestres con la misma cédula.
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

        -- Auditoría de la actualización: la captura el trigger genérico sobre `usuarios`.
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

        -- La auditoría de los cambios en `usuarios` ya quedó registrada por el trigger
        -- genérico al hacer el UPDATE de arriba (con el actor seteado más arriba).
    END;
$$;

-- =========================================================
-- FUNCION: obtener_siguiente_num_cita
-- Obtiene el siguiente numero de cita para un caso especifico
-- Parametros:
--   id_caso_param INTEGER: ID del caso
--
CREATE OR REPLACE FUNCTION obtener_siguiente_num_cita(id_caso_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    siguiente_num_cita INTEGER;
BEGIN
    SELECT COALESCE(MAX(num_cita), 0) + 1 INTO siguiente_num_cita
    FROM citas
    WHERE id_caso = id_caso_param;
    RETURN siguiente_num_cita;
END;
$$ LANGUAGE plpgsql;


-- =========================================================
-- FUNCIONES
-- =========================================================

-- Función: assign_nombre_usuario_from_email
CREATE OR REPLACE FUNCTION public.assign_nombre_usuario_from_email()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ 
DECLARE 
    nombre_usuario_extracted VARCHAR(100); 
BEGIN 
    IF NEW.nombre_usuario IS NOT NULL AND NEW.nombre_usuario != '' THEN 
        RETURN NEW; 
    END IF; 

    IF NEW.correo_electronico IS NULL OR NEW.correo_electronico = '' THEN 
        RAISE EXCEPTION 'No se puede asignar nombre_usuario: el usuario con cédula % no tiene correo electrónico', NEW.cedula; 
    END IF; 

    nombre_usuario_extracted := SPLIT_PART(NEW.correo_electronico, '@', 1); 

    IF nombre_usuario_extracted IS NULL OR nombre_usuario_extracted = '' THEN 
        RAISE EXCEPTION 'No se puede extraer nombre_usuario del correo: %', NEW.correo_electronico; 
    END IF; 

    NEW.nombre_usuario := nombre_usuario_extracted; 
    RETURN NEW; 
END; 
$function$
;

-- Función: trigger_crear_cambio_estatus_inicial
CREATE OR REPLACE FUNCTION public.trigger_crear_cambio_estatus_inicial()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    num_cambio_actual INTEGER;
    cedula_usuario VARCHAR(20);
BEGIN
    -- Obtener la cédula del usuario desde la variable de sesión unificada
    -- (la establece casos.queries.ts antes de insertar el caso)
    BEGIN
        cedula_usuario := current_setting('app.current_user_id', true);
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso. Error: %', SQLERRM;
    END;

    IF cedula_usuario IS NULL OR cedula_usuario = '' THEN
        RAISE EXCEPTION 'No se puede crear cambio de estatus: no se proporcionó la cédula del usuario que registra el caso (variable vacía)';
    END IF;

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
$function$
;

-- =========================================================
-- SINCRONIZACIÓN DE OCURREN_EN (semestre en que un caso tuvo actividad)
-- =========================================================

-- Función Auxiliar: ensure_case_semester_func
-- Busca el semestre para una fecha y lo asocia al caso si no existe
CREATE OR REPLACE FUNCTION public.ensure_case_semester_func(p_id_caso INT, p_fecha DATE)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_term VARCHAR(20);
BEGIN
    IF p_fecha IS NULL THEN RETURN; END IF;

    SELECT term INTO v_term
    FROM semestres
    WHERE p_fecha BETWEEN fecha_inicio AND fecha_fin
    LIMIT 1;

    IF v_term IS NOT NULL THEN
        INSERT INTO ocurren_en (id_caso, term)
        VALUES (p_id_caso, v_term)
        ON CONFLICT (id_caso, term) DO NOTHING;
    END IF;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_asignacion (se_le_asigna / supervisa, que ya tienen 'term')
-- Función: caso_con_actividad_en_rango
-- Filtro de fechas de los reportes: el caso tiene actividad fechada (inicio, citas,
-- acciones, ejecuciones, cambios de estatus o soportes) dentro de [p_inicio, p_fin].
CREATE OR REPLACE FUNCTION caso_con_actividad_en_rango(p_id_caso INTEGER, p_inicio DATE, p_fin DATE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT (p_inicio IS NULL AND p_fin IS NULL) OR EXISTS (
        SELECT 1
        FROM (
            SELECT fecha_inicio_caso AS fecha FROM casos WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_encuentro FROM citas WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_registro FROM acciones WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_ejecucion FROM ejecutan WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha FROM cambio_estatus WHERE id_caso = p_id_caso
            UNION ALL SELECT fecha_consignacion::date FROM soportes WHERE id_caso = p_id_caso
        ) actividad
        WHERE (p_inicio IS NULL OR actividad.fecha >= p_inicio)
          AND (p_fin IS NULL OR actividad.fecha <= p_fin)
    );
$$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_asignacion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO ocurren_en (id_caso, term)
    VALUES (NEW.id_caso, NEW.term)
    ON CONFLICT (id_caso, term) DO NOTHING;
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_caso (casos.fecha_inicio_caso)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_inicio_caso);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_accion (acciones.fecha_registro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_registro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_cita (citas.fecha_encuentro)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_encuentro::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_estatus (cambio_estatus.fecha)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_estatus()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_soporte (soportes.fecha_consignacion)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_consignacion::DATE);
    RETURN NEW;
END;
$function$
;

-- Trigger Function: sync_ocurren_en_beneficiario (sin fecha propia, usa CURRENT_DATE)
CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, CURRENT_DATE);
    RETURN NEW;
END;
$function$
;
