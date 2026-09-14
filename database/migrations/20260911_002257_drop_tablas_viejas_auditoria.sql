-- =============================================================================
-- Cutover final: elimina auditoria_sesiones, auditoria_reportes (si existe) y
-- auditoria_descarga_soportes, ahora que:
--
--   1. Sus datos ya están copiados en auditoria_eventos (ver
--      20260910_120000_unificar_sesiones_reportes_soportes_en_auditoria_eventos.sql
--      — verificado: 28/28 sesiones, 3/3 descargas de soportes).
--   2. El código de la app (login/logout, registrarAuditoriaReporteAction,
--      registrarDescarga en app/actions/casos.ts) ya escribe directo en
--      auditoria_eventos.
--   3. Las queries de lectura (auditoria-sesiones.queries.ts,
--      auditoria-reportes.queries.ts, auditoria-descarga-soportes.queries.ts,
--      get-unified-logs.sql, count-unified-logs.sql, get-audit-counts.sql,
--      lib/db/queries/auditoria/get-eventos.ts) ya leen de auditoria_eventos.
--   4. Verificado funcionalmente end-to-end contra Neon (login exitoso/
--      fallido, logout, reporte, descarga, feed unificado sin duplicados).
--
-- Es IRREVERSIBLE. Cada DROP usa IF EXISTS para poder re-ejecutarse sin error
-- (auditoria_reportes ya no existía en esta base antes de empezar).
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260911_002257_drop_tablas_viejas_auditoria.sql
-- =============================================================================

DROP TABLE IF EXISTS auditoria_sesiones;
DROP TABLE IF EXISTS auditoria_reportes;
DROP TABLE IF EXISTS auditoria_descarga_soportes;
