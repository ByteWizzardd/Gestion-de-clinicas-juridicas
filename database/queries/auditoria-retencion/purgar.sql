-- Purga manual de auditoria_eventos.
-- Ningún rol de la app tiene DELETE sobre la tabla: se borra solo por esta
-- función (SECURITY DEFINER), que valida que el actor sea un Coordinador
-- habilitado y registra la purga como un evento más.
-- $1 = clases (text[]), $2 = cédula del actor, $3 = simular (true = no borra)
SELECT
    clase,
    eventos_borrados,
    eventos_retenidos,
    to_char(evento_mas_viejo, 'YYYY-MM-DD') AS evento_mas_viejo,
    to_char(evento_mas_nuevo, 'YYYY-MM-DD') AS evento_mas_nuevo
FROM auditoria_purgar($1::text[], $2::varchar, $3::boolean);
