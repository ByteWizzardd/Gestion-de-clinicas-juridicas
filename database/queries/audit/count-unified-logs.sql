-- Contar logs unificados de auditoría (mismo WHERE que get-unified-logs.sql, sin ORDER/LIMIT)
-- Sesiones, reportes y descargas de soportes ya viven en auditoria_eventos —
-- ver get-unified-logs.sql.
SELECT COUNT(*)
{{FILTRO_EVENTOS}};
