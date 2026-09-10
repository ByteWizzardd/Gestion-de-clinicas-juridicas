-- =============================================================================
-- Migración: unificar auditoria_sesiones, auditoria_reportes y
-- auditoria_descarga_soportes dentro de auditoria_eventos.
--
-- Contexto: plan-backend-auditoria.md §4 ya especificaba que estos 3 "casos
-- especiales" debían vivir en auditoria_eventos (entidad='sesion'|'reporte'|
-- 'soporte'), pero en schema.sql quedaron restauradas como tablas aparte
-- ("-- Restaurando tablas especiales excluidas de la auditoría unificada").
-- Esta migración copia los datos existentes hacia auditoria_eventos.
--
-- Es ADITIVA y SEGURA de re-ejecutar (idempotente): cada fila copiada queda
-- marcada en metadata._migrado_de + metadata._id_origen, y el INSERT
-- correspondiente la salta si ya existe. NO borra ni renombra las tablas
-- viejas todavía — eso es un paso de cutover aparte, que solo debe correr
-- una vez el código de la app (login/logout, generación de reportes,
-- descarga de soportes, y las queries de lectura de auditoría) apunte a
-- auditoria_eventos y se haya verificado en la app real.
--
-- NOTA: auditoria_reportes está en schema.sql pero nunca se llegó a crear
-- en Neon (comprobado en vivo el 2026-09-10) — cada bloque se salta solo
-- (usando EXECUTE dinámico) si su tabla origen no existe, para que esta
-- migración corra igual de bien hoy (2 de 3 tablas) que el día que exista
-- auditoria_reportes.
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260910_120000_unificar_sesiones_reportes_soportes_en_auditoria_eventos.sql
-- =============================================================================

BEGIN;

DO $$
DECLARE
    v_sesiones_origen   INT := 0;
    v_sesiones_destino  INT := 0;
    v_reportes_origen   INT := 0;
    v_reportes_destino  INT := 0;
    v_soportes_origen   INT := 0;
    v_soportes_destino  INT := 0;
BEGIN
    -- -------------------------------------------------------------------
    -- 1. Sesiones -> entidad = 'sesion'
    --    operacion = 'intento_fallido' si exitoso = false, si no 'inicio_sesion'.
    --    fecha_cierre (si existe) se guarda en metadata, igual que hará el
    --    UPDATE de logout una vez migrado el código (plan-backend-auditoria §4).
    -- -------------------------------------------------------------------
    IF to_regclass('public.auditoria_sesiones') IS NOT NULL THEN
        INSERT INTO auditoria_eventos (
            entidad, operacion, id_entidad, id_usuario,
            datos_nuevos, metadata, fecha_evento
        )
        SELECT
            'sesion',
            CASE WHEN s.exitoso = FALSE THEN 'intento_fallido' ELSE 'inicio_sesion' END,
            s.id_sesion::text,
            s.cedula_usuario,
            jsonb_build_object('exitoso', s.exitoso),
            jsonb_strip_nulls(jsonb_build_object(
                'ip', s.ip_direccion,
                'dispositivo', s.dispositivo,
                'fecha_cierre', s.fecha_cierre,
                '_migrado_de', 'auditoria_sesiones',
                '_id_origen', s.id_sesion
            )),
            s.fecha_inicio
        FROM auditoria_sesiones s
        WHERE NOT EXISTS (
            SELECT 1 FROM auditoria_eventos ae
            WHERE ae.entidad = 'sesion'
              AND ae.metadata->>'_migrado_de' = 'auditoria_sesiones'
              AND (ae.metadata->>'_id_origen')::int = s.id_sesion
        );

        SELECT COUNT(*) INTO v_sesiones_origen FROM auditoria_sesiones;
        SELECT COUNT(*) INTO v_sesiones_destino FROM auditoria_eventos WHERE metadata->>'_migrado_de' = 'auditoria_sesiones';
        IF v_sesiones_origen <> v_sesiones_destino THEN
            RAISE EXCEPTION 'Conteo de sesiones no cuadra: origen=%, migrado=%', v_sesiones_origen, v_sesiones_destino;
        END IF;
        RAISE NOTICE 'sesiones migradas: %', v_sesiones_destino;
    ELSE
        RAISE NOTICE 'auditoria_sesiones no existe, se salta.';
    END IF;

    -- -------------------------------------------------------------------
    -- 2. Reportes -> entidad = 'reporte'
    --    operacion = 'vista_previa_reporte' | 'generacion_reporte'.
    --    filtros_aplicados ya se guarda como texto JSON válido (ver
    --    lib/db/queries/auditoria-reportes.queries.ts: JSON.stringify antes
    --    de insertar), así que el cast a jsonb es directo.
    -- -------------------------------------------------------------------
    IF to_regclass('public.auditoria_reportes') IS NOT NULL THEN
        INSERT INTO auditoria_eventos (
            entidad, operacion, id_entidad, id_usuario,
            datos_nuevos, metadata, fecha_evento
        )
        SELECT
            'reporte',
            CASE WHEN r.operacion = 'vista_previa' THEN 'vista_previa_reporte' ELSE 'generacion_reporte' END,
            r.id::text,
            r.id_usuario_genero,
            jsonb_strip_nulls(jsonb_build_object(
                'tipo_reporte', r.tipo_reporte,
                'formato', r.formato,
                'cedula_solicitante', r.cedula_solicitante
            )) || COALESCE(NULLIF(r.filtros_aplicados, '')::jsonb, '{}'::jsonb),
            jsonb_build_object('_migrado_de', 'auditoria_reportes', '_id_origen', r.id),
            r.fecha_generacion
        FROM auditoria_reportes r
        WHERE NOT EXISTS (
            SELECT 1 FROM auditoria_eventos ae
            WHERE ae.entidad = 'reporte'
              AND ae.metadata->>'_migrado_de' = 'auditoria_reportes'
              AND (ae.metadata->>'_id_origen')::int = r.id
        );

        SELECT COUNT(*) INTO v_reportes_origen FROM auditoria_reportes;
        SELECT COUNT(*) INTO v_reportes_destino FROM auditoria_eventos WHERE metadata->>'_migrado_de' = 'auditoria_reportes';
        IF v_reportes_origen <> v_reportes_destino THEN
            RAISE EXCEPTION 'Conteo de reportes no cuadra: origen=%, migrado=%', v_reportes_origen, v_reportes_destino;
        END IF;
        RAISE NOTICE 'reportes migrados: %', v_reportes_destino;
    ELSE
        RAISE NOTICE 'auditoria_reportes no existe todavia en esta base, se salta.';
    END IF;

    -- -------------------------------------------------------------------
    -- 3. Descargas de soportes -> entidad = 'soporte', operacion = 'descarga_soporte'
    -- -------------------------------------------------------------------
    IF to_regclass('public.auditoria_descarga_soportes') IS NOT NULL THEN
        INSERT INTO auditoria_eventos (
            entidad, operacion, id_entidad, id_usuario,
            datos_nuevos, metadata, fecha_evento
        )
        SELECT
            'soporte',
            'descarga_soporte',
            d.num_soporte::text || '-' || d.id_caso::text,
            d.cedula_descargo,
            jsonb_build_object(
                'nombre_archivo', d.nombre_archivo,
                'num_soporte', d.num_soporte,
                'id_caso', d.id_caso
            ),
            jsonb_strip_nulls(jsonb_build_object(
                'ip', d.ip_direccion,
                '_migrado_de', 'auditoria_descarga_soportes',
                '_id_origen', d.id
            )),
            d.fecha_descarga
        FROM auditoria_descarga_soportes d
        WHERE NOT EXISTS (
            SELECT 1 FROM auditoria_eventos ae
            WHERE ae.entidad = 'soporte'
              AND ae.metadata->>'_migrado_de' = 'auditoria_descarga_soportes'
              AND (ae.metadata->>'_id_origen')::int = d.id
        );

        SELECT COUNT(*) INTO v_soportes_origen FROM auditoria_descarga_soportes;
        SELECT COUNT(*) INTO v_soportes_destino FROM auditoria_eventos WHERE metadata->>'_migrado_de' = 'auditoria_descarga_soportes';
        IF v_soportes_origen <> v_soportes_destino THEN
            RAISE EXCEPTION 'Conteo de descargas de soportes no cuadra: origen=%, migrado=%', v_soportes_origen, v_soportes_destino;
        END IF;
        RAISE NOTICE 'descargas de soportes migradas: %', v_soportes_destino;
    ELSE
        RAISE NOTICE 'auditoria_descarga_soportes no existe, se salta.';
    END IF;
END $$;

COMMIT;

-- =============================================================================
-- NO EJECUTAR TODAVÍA (cutover, requiere confirmación explícita del usuario
-- y que el código de la app ya lea/escriba contra auditoria_eventos):
--
-- ALTER TABLE auditoria_sesiones RENAME TO auditoria_sesiones_old;
-- ALTER TABLE auditoria_reportes RENAME TO auditoria_reportes_old;              -- si llega a existir
-- ALTER TABLE auditoria_descarga_soportes RENAME TO auditoria_descarga_soportes_old;
--
-- El DROP TABLE definitivo de las *_old va en una migración de limpieza
-- aparte, solo cuando el usuario confirme que ya validó todo (irreversible).
-- =============================================================================
