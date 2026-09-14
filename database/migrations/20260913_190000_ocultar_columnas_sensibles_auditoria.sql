-- =============================================================================
-- Fix: fn_auditoria_generica copia la fila completa con to_jsonb(NEW/OLD), así
-- que al crear un usuario o cambiarle la contraseña guardaba el hash
-- (usuarios.contrasena) en auditoria_eventos, y al subir/eliminar un soporte
-- guardaba el contenido del archivo (soportes.documento_data). Además de ser
-- información sensible, get-unified-logs.sql la enviaba al navegador del
-- coordinador (esa lectura ya se corrigió aparte, quitando esas claves).
--
-- Esta migración:
--   1. Redefine fn_auditoria_generica para que esas columnas nunca se copien
--      con su valor: en inserción/eliminación se omiten; en actualización, si
--      cambiaron, se registra la clave con el marcador '[oculto]' (así el
--      evento de "cambió la contraseña" sigue existiendo, sin el hash).
--   2. Si la escritura no pasó por withAuditTransaction (p. ej. el cambio de
--      estatus usa pool.query directo), app.current_user_id está vacío y el
--      evento quedaba sin actor. En inserciones se usa como respaldo la columna
--      de la propia fila que guarda quién la registró (id_usuario_cambia,
--      id_usuario_registro, id_usuario_subio).
--   3. Limpia cualquier evento ya guardado con esos valores (idempotente;
--      al momento de escribir esto no había ninguno: todos los eventos de
--      usuario/soporte eran migrados).
--
-- Idempotente: CREATE OR REPLACE FUNCTION + UPDATE ... WHERE ? clave.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260913_190000_ocultar_columnas_sensibles_auditoria.sql
-- =============================================================================

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

-- Limpieza de eventos ya guardados con valores sensibles.
UPDATE auditoria_eventos
SET datos_anteriores = CASE
        WHEN operacion = 'actualizacion' THEN datos_anteriores
            || (SELECT COALESCE(jsonb_object_agg(k, '[oculto]'), '{}'::jsonb)
                FROM unnest(ARRAY['contrasena', 'documento_data']) k WHERE datos_anteriores ? k)
        ELSE datos_anteriores - ARRAY['contrasena', 'documento_data']
    END,
    datos_nuevos = CASE
        WHEN operacion = 'actualizacion' THEN datos_nuevos
            || (SELECT COALESCE(jsonb_object_agg(k, '[oculto]'), '{}'::jsonb)
                FROM unnest(ARRAY['contrasena', 'documento_data']) k WHERE datos_nuevos ? k)
        ELSE datos_nuevos - ARRAY['contrasena', 'documento_data']
    END
WHERE (datos_anteriores ?| ARRAY['contrasena', 'documento_data'] AND datos_anteriores->>'contrasena' IS DISTINCT FROM '[oculto]')
   OR (datos_nuevos ?| ARRAY['contrasena', 'documento_data'] AND datos_nuevos->>'contrasena' IS DISTINCT FROM '[oculto]');
