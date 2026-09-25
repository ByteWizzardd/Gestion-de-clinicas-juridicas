-- =========================================================
-- Corregir la ventana calendario (fecha_inicio/fecha_fin) del catálogo de
-- semestres. Los nombres (TERM) ya se corrigieron en
-- 20260925_120000_corregir_nombres_semestres.sql; esta migración ajusta las
-- fechas a las reales de la UCAB (ver [[convencion-semestres]]):
--
--   2024-25: 15/01/2024–15/08/2024 → 01/03/2024–31/07/2024
--   2025-15: 15/08/2024–15/01/2025 → 01/09/2024–31/01/2025
--   2025-25: 15/01/2025–15/08/2025 → 01/03/2025–31/07/2025
--   2026-15: 15/08/2025–15/01/2026 → 01/09/2025–31/01/2026
--   2026-25: 20/03/2026–15/08/2026 → 01/03/2026–31/07/2026
--
-- 2027-15 no se toca: ya tenía la fecha real cargada a mano.
--
-- Aplicada en producción el 2026-09-25 vía el endpoint SQL-over-HTTP de Neon.

BEGIN;

SELECT set_config('app.current_user_id', 'V-77777777', true);
SELECT set_config('app.audit_metadata',
    '{"accion_negocio": "Correccion de ventana calendario de semestres (fechas reales de la UCAB)"}', true);

UPDATE semestres SET fecha_inicio = '2024-03-01', fecha_fin = '2024-07-31' WHERE term = '2024-25';
UPDATE semestres SET fecha_inicio = '2024-09-01', fecha_fin = '2025-01-31' WHERE term = '2025-15';
UPDATE semestres SET fecha_inicio = '2025-03-01', fecha_fin = '2025-07-31' WHERE term = '2025-25';
UPDATE semestres SET fecha_inicio = '2025-09-01', fecha_fin = '2026-01-31' WHERE term = '2026-15';
UPDATE semestres SET fecha_inicio = '2026-03-01', fecha_fin = '2026-07-31' WHERE term = '2026-25';

COMMIT;
