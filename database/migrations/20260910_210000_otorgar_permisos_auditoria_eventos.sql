-- =============================================================================
-- Fix: otorgar a rol_coordinador/rol_profesor/rol_estudiante los permisos
-- sobre auditoria_eventos que ya estaban declarados en schema.sql
-- ("-- Permisos para la nueva tabla unificada de auditoría") pero que nunca
-- se ejecutaron contra la base real.
--
-- Síntoma: "permission denied for table auditoria_eventos" al crear/editar
-- cualquier registro auditado (casos, catálogos, etc.) — lib/db/secure-
-- transactions.ts hace `SET LOCAL ROLE <rol>` antes del INSERT/UPDATE, y el
-- trigger genérico (fn_auditoria_generica) intenta escribir en
-- auditoria_eventos con ese rol, que no tenía ningún privilegio ahí (solo
-- neondb_owner, el dueño de la tabla, tenía acceso).
--
-- Es idempotente (los GRANT se pueden repetir sin error).
--
-- Uso:
--   psql "$DATABASE_URL" -f database/migrations/20260910_210000_otorgar_permisos_auditoria_eventos.sql
-- =============================================================================

GRANT INSERT, UPDATE ON auditoria_eventos TO rol_coordinador, rol_profesor, rol_estudiante;
GRANT SELECT ON auditoria_eventos TO rol_coordinador;
GRANT USAGE, SELECT ON SEQUENCE auditoria_eventos_id_seq TO rol_coordinador, rol_profesor, rol_estudiante;
