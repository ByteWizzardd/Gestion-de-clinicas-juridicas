-- Contadores por módulo: mismos eventos visibles que el feed (fragmento
-- compartido filtro-eventos.sql, sin filtros de UI), agrupados por la entidad
-- y operación bajo la que se muestran.
SELECT
    t.entidad_vista AS entidad,
    t.operacion_vista AS operacion,
    COUNT(*)::int AS total,
    MAX(t.fecha_evento) AS ultima_actividad
{{FILTRO_EVENTOS}}
GROUP BY t.entidad_vista, t.operacion_vista
