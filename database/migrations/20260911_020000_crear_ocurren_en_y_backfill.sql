-- =============================================================================
-- Fix: la tabla ocurren_en (y todo su sistema de sincronización) estaba
-- completamente declarada en schema.sql (tabla + 7 funciones trigger) pero
-- nunca se desplegó contra Neon. Síntoma: la lista de casos
-- (database/queries/casos/get-all-with-profesor.sql) hace un subquery
-- `SELECT array_agg(oe.term...) FROM ocurren_en oe...` para el filtro de
-- semestre, y como la tabla no existe, TODA la consulta fallaba con
-- "relation ocurren_en does not exist" -> la página de casos no mostraba
-- ninguno (no es un problema de datos: los 22 casos siguen intactos en la
-- tabla `casos`, confirmado).
--
-- Ningún trigger de escritura (casos/acciones/citas/etc.) llegó a
-- depender de ocurren_en en Neon todavía, así que esto solo bloqueaba
-- LECTURA, no bloqueaba crear/editar nada.
--
-- Esta migración:
--   1. Crea la tabla ocurren_en.
--   2. Crea ensure_case_semester_func + las 7 funciones trigger.
--   3. Las conecta a casos/acciones/citas/cambio_estatus/soportes/
--      beneficiarios/se_le_asigna/supervisa (igual que schema.sql).
--   4. Otorga permisos a rol_coordinador/rol_profesor/rol_estudiante (para
--      no repetir el bug de auditoria_eventos: sin esto, los triggers
--      fallarían con "permission denied" apenas alguien cree un caso).
--   5. Hace backfill de los datos ya existentes, para que el filtro de
--      semestre también funcione con casos viejos (no solo los nuevos).
--      No se hace backfill de `beneficiarios` porque su trigger usa
--      CURRENT_DATE (no una fecha histórica real) — asociarlos hoy con el
--      semestre actual ensuciaría el filtro para casos viejos; su semestre
--      ya queda cubierto por las otras fuentes (fecha_inicio_caso, acciones,
--      citas, cambio_estatus).
--
-- Idempotente: CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
-- DROP TRIGGER IF EXISTS + CREATE TRIGGER, y el backfill usa
-- ON CONFLICT DO NOTHING (vía ensure_case_semester_func).
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260911_020000_crear_ocurren_en_y_backfill.sql
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1) Tabla
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ocurren_en (
    id_caso INTEGER NOT NULL,
    term VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_caso, term),
    FOREIGN KEY (id_caso) REFERENCES casos(id_caso)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (term) REFERENCES semestres(term)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- -----------------------------------------------------------------------
-- 2) Funciones
-- -----------------------------------------------------------------------
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
$function$;

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
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_caso()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_inicio_caso);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_accion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_registro::DATE);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_cita()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_encuentro::DATE);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_estatus()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha::DATE);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_soporte()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, NEW.fecha_consignacion::DATE);
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_sync_ocurren_en_beneficiario()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.ensure_case_semester_func(NEW.id_caso, CURRENT_DATE);
    RETURN NEW;
END;
$function$;

-- -----------------------------------------------------------------------
-- 3) Triggers
-- -----------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_sync_semestre_asignacion ON se_le_asigna;
CREATE TRIGGER trigger_sync_semestre_asignacion
AFTER INSERT ON se_le_asigna
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_supervision ON supervisa;
CREATE TRIGGER trigger_sync_semestre_supervision
AFTER INSERT ON supervisa
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_asignacion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_caso ON casos;
CREATE TRIGGER trigger_sync_semestre_caso
AFTER INSERT OR UPDATE OF fecha_inicio_caso ON casos
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_caso();

DROP TRIGGER IF EXISTS trigger_sync_semestre_accion ON acciones;
CREATE TRIGGER trigger_sync_semestre_accion
AFTER INSERT ON acciones
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_accion();

DROP TRIGGER IF EXISTS trigger_sync_semestre_cita ON citas;
CREATE TRIGGER trigger_sync_semestre_cita
AFTER INSERT OR UPDATE OF fecha_encuentro ON citas
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_cita();

DROP TRIGGER IF EXISTS trigger_sync_semestre_estatus ON cambio_estatus;
CREATE TRIGGER trigger_sync_semestre_estatus
AFTER INSERT ON cambio_estatus
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_estatus();

DROP TRIGGER IF EXISTS trigger_sync_semestre_soporte ON soportes;
CREATE TRIGGER trigger_sync_semestre_soporte
AFTER INSERT ON soportes
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_soporte();

DROP TRIGGER IF EXISTS trigger_sync_semestre_beneficiario ON beneficiarios;
CREATE TRIGGER trigger_sync_semestre_beneficiario
AFTER INSERT ON beneficiarios
FOR EACH ROW EXECUTE FUNCTION trigger_sync_ocurren_en_beneficiario();

-- -----------------------------------------------------------------------
-- 4) Permisos (mismo patrón que cambio_estatus)
-- -----------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ocurren_en TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT REFERENCES, TRUNCATE ON ocurren_en TO rol_coordinador;

-- -----------------------------------------------------------------------
-- 5) Backfill de datos existentes
-- -----------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id_caso, term FROM se_le_asigna LOOP
        INSERT INTO ocurren_en (id_caso, term) VALUES (r.id_caso, r.term) ON CONFLICT DO NOTHING;
    END LOOP;

    FOR r IN SELECT id_caso, term FROM supervisa LOOP
        INSERT INTO ocurren_en (id_caso, term) VALUES (r.id_caso, r.term) ON CONFLICT DO NOTHING;
    END LOOP;

    FOR r IN SELECT id_caso, fecha_inicio_caso AS fecha FROM casos WHERE fecha_inicio_caso IS NOT NULL LOOP
        PERFORM ensure_case_semester_func(r.id_caso, r.fecha);
    END LOOP;

    FOR r IN SELECT id_caso, fecha_registro::date AS fecha FROM acciones WHERE fecha_registro IS NOT NULL LOOP
        PERFORM ensure_case_semester_func(r.id_caso, r.fecha);
    END LOOP;

    FOR r IN SELECT id_caso, fecha_encuentro::date AS fecha FROM citas WHERE fecha_encuentro IS NOT NULL LOOP
        PERFORM ensure_case_semester_func(r.id_caso, r.fecha);
    END LOOP;

    FOR r IN SELECT id_caso, fecha::date AS fecha FROM cambio_estatus WHERE fecha IS NOT NULL LOOP
        PERFORM ensure_case_semester_func(r.id_caso, r.fecha);
    END LOOP;

    FOR r IN SELECT id_caso, fecha_consignacion::date AS fecha FROM soportes WHERE fecha_consignacion IS NOT NULL LOOP
        PERFORM ensure_case_semester_func(r.id_caso, r.fecha);
    END LOOP;

    RAISE NOTICE 'Backfill de ocurren_en completo: % filas', (SELECT COUNT(*) FROM ocurren_en);
END $$;
