-- Registra la descarga de un soporte como evento de auditoria_eventos
-- (entidad='soporte', operacion='descarga_soporte'). Esta carpeta no existía
-- antes: lib/db/queries/auditoria-descarga-soportes.queries.ts cargaba
-- 'auditoria-descarga-soportes/insert.sql' pero el archivo nunca se creó,
-- así que cualquier llamada a registrarDescarga() estaba rota.
-- $1 = num_soporte, $2 = id_caso, $3 = nombre_archivo, $4 = cedula_descargo, $5 = ip_direccion
INSERT INTO auditoria_eventos (
    entidad, operacion, id_entidad, id_usuario, datos_nuevos, metadata, fecha_evento
) VALUES (
    'soporte',
    'descarga_soporte',
    $1::text || '-' || $2::text,
    $4,
    jsonb_build_object('nombre_archivo', $3, 'num_soporte', $1, 'id_caso', $2),
    jsonb_strip_nulls(jsonb_build_object('ip', $5)),
    (NOW() AT TIME ZONE 'America/Caracas')
) RETURNING id, fecha_evento AS fecha_descarga;
