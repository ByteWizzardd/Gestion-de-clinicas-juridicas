-- =========================================================
-- Corregir los nombres (TERM) del catálogo de semestres
-- =========================================================
-- El catálogo se cargó con la convención invertida: el 15 como el semestre
-- de enero a agosto y el 25 como el de agosto a enero. El calendario real de
-- la UCAB nombra cada semestre por el año en que TERMINA:
--
--   YYYY-15: septiembre de YYYY-1 → enero de YYYY
--   YYYY-25: marzo → julio de YYYY
--
-- Las fechas están bien; lo que está corrido es el nombre. Cada TERM pasa al
-- siguiente en la secuencia:
--
--   2024-15 (ene–ago 2024)       → 2024-25
--   2024-25 (ago 2024–ene 2025)  → 2025-15
--   2025-15 (ene–ago 2025)       → 2025-25
--   2025-25 (ago 2025–ene 2026)  → 2026-15
--   2026-15 (ene–ago 2026)       → 2026-25
--   2026-25 (ago 2026–ene 2027)  → 2027-15
--
-- Todas las FK hacia semestres(term) son ON UPDATE CASCADE (ocurren_en,
-- estudiantes, profesores, coordinadores y, a través de estas, supervisa y
-- se_le_asigna), así que renombrar arrastra cada inscripción y asignación.
-- Se renombra del más nuevo al más viejo para que el nombre destino siempre
-- esté libre (el CHECK de formato no deja usar nombres temporales).
--
-- Si el nombre destino ya existe (creado a mano con la convención buena), se
-- conserva ese y se elimina el viejo, siempre que no tenga nada asociado.
--
-- Solo actúa si el catálogo sigue con la convención vieja (2024-25 empezando
-- en agosto de 2024); si ya se corrió, no hace nada.

BEGIN;

SELECT set_config('app.current_user_id', 'V-77777777', true);
SELECT set_config('app.audit_metadata',
    '{"accion_negocio": "Corrección de nombres de semestres (convención 15 = sep–ene, 25 = mar–jul)"}', true);

DO $$
DECLARE
    v_par TEXT[];
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM semestres
        WHERE term = '2024-25' AND fecha_inicio BETWEEN '2024-07-01' AND '2024-10-31'
    ) THEN
        RAISE NOTICE 'El catálogo ya usa la convención correcta; no se renombra nada.';
        RETURN;
    END IF;

    FOREACH v_par SLICE 1 IN ARRAY ARRAY[
        ['2026-25', '2027-15'],
        ['2026-15', '2026-25'],
        ['2025-25', '2026-15'],
        ['2025-15', '2025-25'],
        ['2024-25', '2025-15'],
        ['2024-15', '2024-25']
    ] LOOP
        IF EXISTS (SELECT 1 FROM semestres WHERE term = v_par[2]) THEN
            -- El nombre correcto ya se creó a mano desde la app (pasó en
            -- producción con el 2027-15, con sus fechas reales). Se queda ese
            -- y se elimina el viejo, siempre que nada lo use; si algo lo usa,
            -- mejor detenerse que mezclar dos semestres.
            IF EXISTS (SELECT 1 FROM ocurren_en WHERE term = v_par[1])
               OR EXISTS (SELECT 1 FROM estudiantes WHERE term = v_par[1])
               OR EXISTS (SELECT 1 FROM profesores WHERE term = v_par[1])
               OR EXISTS (SELECT 1 FROM coordinadores WHERE term = v_par[1]) THEN
                RAISE EXCEPTION 'Ya existe el semestre % y el viejo % tiene registros asociados; hay que resolverlo a mano.',
                    v_par[2], v_par[1];
            END IF;
            DELETE FROM semestres WHERE term = v_par[1];
        ELSE
            UPDATE semestres SET term = v_par[2] WHERE term = v_par[1];
        END IF;
    END LOOP;
END $$;

COMMIT;
