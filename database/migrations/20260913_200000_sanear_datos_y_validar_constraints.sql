-- =============================================================================
-- Saneamiento de datos inválidos y validación de todas las constraints
-- =============================================================================
-- Contexto: en Neon varias CHECK se agregaron con NOT VALID, así que no se
-- verificaron contra las filas existentes. 14 casos semilla (#20-24, #30-38)
-- tenían fecha_solicitud = 2025-12-24 (el día de la carga) y una fecha de
-- inicio de 2023-2024, violando chk_casos_inicio_post_solicitud. PostgreSQL
-- vuelve a evaluar la CHECK en cada UPDATE de la fila, así que CUALQUIER
-- edición de esos casos fallaba, incluido el UPDATE de casos que hace mover una
-- categoría o un ámbito legal de jerarquía.
--
-- Además, 2 solicitantes semilla tenían el teléfono local con guion
-- ("0212-5559012"), formato que el formulario ya no acepta (7 a 11 dígitos), y
-- Neon no tenía la CHECK de teléfono local que sí declara schema.sql.
--
-- Corrección (no se elimina nada: los casos tienen citas, acciones,
-- beneficiarios y equipo):
--   * fecha_solicitud = fecha_inicio_caso (el inicio real del caso).
--   * teléfono local sin caracteres que no sean dígitos.
-- Los triggers de auditoría registran el antes/después de cada fila.
--
-- Blindaje:
--   * VALIDATE CONSTRAINT de las 11 CHECK que estaban NOT VALID.
--   * Nueva CHECK del teléfono local (solo dígitos, 7 a 11).
--   * Aserción final: la migración falla si queda alguna constraint sin validar.
--
-- Idempotente: los UPDATE no tocan filas ya válidas y VALIDATE / ADD usan guardas.
-- =============================================================================

BEGIN;

SELECT set_config('app.audit_metadata', json_build_object(
    'accion_negocio', 'Corrección de datos inválidos',
    'motivo', 'Migración 20260913_200000: datos semilla que violaban reglas de validación'
)::text, true);

-- 1. Casos cuya fecha de inicio es anterior a la de solicitud
UPDATE casos
SET fecha_solicitud = fecha_inicio_caso
WHERE fecha_inicio_caso < fecha_solicitud;

-- 2. Teléfonos locales con caracteres no numéricos
UPDATE solicitantes
SET telefono_local = NULLIF(regexp_replace(telefono_local, '[^0-9]', '', 'g'), '')
WHERE telefono_local ~ '[^0-9]';

-- 3. Validar todas las CHECK que quedaron NOT VALID
ALTER TABLE acciones       VALIDATE CONSTRAINT chk_acciones_registro_pasado;
ALTER TABLE atienden       VALIDATE CONSTRAINT chk_atienden_registro_pasado;
ALTER TABLE beneficiarios  VALIDATE CONSTRAINT chk_beneficiarios_nac_pasado;
ALTER TABLE cambio_estatus VALIDATE CONSTRAINT chk_cambio_estatus_fecha_pasada;
ALTER TABLE casos          VALIDATE CONSTRAINT chk_casos_fin_post_inicio;
ALTER TABLE casos          VALIDATE CONSTRAINT chk_casos_inicio_pasado;
ALTER TABLE casos          VALIDATE CONSTRAINT chk_casos_inicio_post_solicitud;
ALTER TABLE casos          VALIDATE CONSTRAINT chk_casos_solicitud_pasada;
ALTER TABLE citas          VALIDATE CONSTRAINT chk_citas_proxima_posterior;
ALTER TABLE ejecutan       VALIDATE CONSTRAINT chk_ejecutan_fecha_pasada;
ALTER TABLE solicitantes   VALIDATE CONSTRAINT chk_solicitantes_nacimiento_pasado;

-- 4. Teléfono local: solo dígitos, entre 7 y 11 (igual que el formulario)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'solicitantes'::regclass AND conname = 'solicitantes_telefono_local_check'
    ) THEN
        ALTER TABLE solicitantes
            ADD CONSTRAINT solicitantes_telefono_local_check
            CHECK (telefono_local IS NULL OR telefono_local ~ '^[0-9]{7,11}$');
    END IF;
END $$;

-- 5. Ninguna constraint del esquema puede quedar sin validar
DO $$
DECLARE
    pendientes TEXT;
BEGIN
    SELECT string_agg(conrelid::regclass || '.' || conname, ', ')
    INTO pendientes
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace AND NOT convalidated;

    IF pendientes IS NOT NULL THEN
        RAISE EXCEPTION 'Constraints sin validar: %', pendientes;
    END IF;
END $$;

COMMIT;
