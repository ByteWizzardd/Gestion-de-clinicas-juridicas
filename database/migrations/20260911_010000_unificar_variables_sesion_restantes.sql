-- =============================================================================
-- Fix: 3 funciones/triggers quedaron sin migrar a la convención unificada
-- de sesión (app.current_user_id) del backend de auditoría. Encontrado con
-- un barrido de pg_get_functiondef sobre todas las funciones de `public`
-- buscando 'app.usuario_%'.
--
-- 1) trigger_crear_cambio_estatus_inicial (AFTER INSERT ON casos): leía
--    'app.usuario_registra', que casos.queries.ts ya no setea (setea
--    'app.current_user_id') -> RAISE EXCEPTION en TODA creación de caso
--    ("no se proporcionó la cédula... variable vacía"). Fix: usar
--    'app.current_user_id', igual que ya hacía la versión en schema.sql
--    (la que se desplegó en Neon había quedado desactualizada).
--
-- 2) trigger_auditar_eliminacion_soporte (BEFORE DELETE ON soportes):
--    inserta en auditoria_eliminacion_soportes, tabla que ya no existe
--    (verificado). trg_audit_soportes (genérico) ya cubre
--    entidad='soporte'/operacion='eliminacion' en auditoria_eventos. Nunca
--    bloqueaba nada (su propio manejo de excepción solo hace RAISE WARNING
--    y sigue), pero es 100% código muerto -> se elimina el trigger y la
--    función.
--
-- 3) eliminar_caso_fisico: la versión desplegada en Neon había quedado
--    atrás — seteaba una mezcla de variables viejas
--    (app.usuario_elimina_caso/cita/accion/soporte, la última huérfana tras
--    el punto 2) en vez de la convención unificada. schema.sql YA tenía la
--    versión correcta (un solo app.current_user_id + app.audit_metadata, y
--    el evento de accion_ejecutores insertado directo en auditoria_eventos
--    antes del DELETE) — acá solo se redespliega esa misma versión.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260911_010000_unificar_variables_sesion_restantes.sql
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1) trigger_crear_cambio_estatus_inicial
-- -----------------------------------------------------------------------
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

    SELECT COALESCE(MAX(num_cambio), 0) + 1 INTO num_cambio_actual
    FROM cambio_estatus
    WHERE id_caso = NEW.id_caso;

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
$function$;

-- -----------------------------------------------------------------------
-- 2) Eliminar el trigger/función viejos de eliminación de soportes
--    (duplicaban lo que ya hace trg_audit_soportes en auditoria_eventos,
--    y apuntaban a una tabla que ya no existe)
-- -----------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_auditar_eliminacion_soporte ON public.soportes;
DROP FUNCTION IF EXISTS public.trigger_auditar_eliminacion_soporte();

-- -----------------------------------------------------------------------
-- 3) eliminar_caso_fisico: redesplegar la versión ya correcta de schema.sql
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION eliminar_caso_fisico(
    p_id_caso INTEGER,
    p_cedula_actor VARCHAR,
    p_motivo TEXT
) RETURNS VOID AS $$
DECLARE
    v_motivo_relacionados TEXT;
    v_ejecutores_json JSONB;
BEGIN
    IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
        RAISE EXCEPTION 'El motivo es obligatorio para eliminaciones físicas de casos';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM casos WHERE id_caso = p_id_caso) THEN
        RAISE EXCEPTION 'El caso con ID % no existe', p_id_caso;
    END IF;

    v_motivo_relacionados := p_motivo || ' (Eliminado por eliminación del caso #' || p_id_caso || ')';

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
        -- Variable de sesión unificada, leída por los triggers genéricos de
        -- casos/citas/acciones/beneficiarios/soportes en la misma cascada.
        PERFORM set_config('app.current_user_id', p_cedula_actor, true);
        PERFORM set_config('app.audit_metadata', jsonb_build_object('motivo', v_motivo_relacionados)::text, true);

        -- Registrar los ejecutores de cada acción como su propio evento de
        -- auditoría ANTES de borrarlos (una vez eliminado `ejecutan`, esta
        -- información se pierde).
        INSERT INTO auditoria_eventos (entidad, operacion, id_entidad, id_usuario, datos_anteriores, metadata)
        SELECT
            'accion_ejecutores',
            'eliminacion',
            num_accion,
            p_cedula_actor,
            jsonb_build_object('ejecutores', detalle -> 'ejecutores_detalle'),
            jsonb_build_object('motivo', v_motivo_relacionados)
        FROM jsonb_each(v_ejecutores_json) AS t(num_accion, detalle);

        DELETE FROM ejecutan WHERE id_caso = p_id_caso;
        DELETE FROM acciones WHERE id_caso = p_id_caso;
        DELETE FROM atienden WHERE id_caso = p_id_caso;
        DELETE FROM citas WHERE id_caso = p_id_caso;
        DELETE FROM cambio_estatus WHERE id_caso = p_id_caso;
        DELETE FROM soportes WHERE id_caso = p_id_caso;
        DELETE FROM beneficiarios WHERE id_caso = p_id_caso;
        DELETE FROM supervisa WHERE id_caso = p_id_caso;
        DELETE FROM se_le_asigna WHERE id_caso = p_id_caso;
        DELETE FROM casos WHERE id_caso = p_id_caso;

    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'No se puede eliminar el caso porque aún tiene referencias activas. Detalle: %', SQLERRM;
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error al eliminar caso: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;
