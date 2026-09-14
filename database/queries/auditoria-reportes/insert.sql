-- Registra la generación/vista previa de un reporte como evento de
-- auditoria_eventos (entidad='reporte'), en vez de una fila en la vieja
-- tabla auditoria_reportes (que nunca llegó a crearse en la base real).
-- $1 = tipo_reporte, $2 = filtros_aplicados (JSON texto u null),
-- $3 = id_usuario_genero, $4 = formato, $5 = cedula_solicitante (opcional),
-- $6 = operacion ('generacion' | 'vista_previa')
INSERT INTO auditoria_eventos (
    entidad, operacion, id_usuario, datos_nuevos, fecha_evento
) VALUES (
    'reporte',
    CASE WHEN $6::text = 'vista_previa' THEN 'vista_previa_reporte' ELSE 'generacion_reporte' END,
    $3::varchar,
    jsonb_strip_nulls(jsonb_build_object(
        'tipo_reporte', $1::text,
        'formato', $4::text,
        'cedula_solicitante', $5::text
    )) || COALESCE($2::jsonb, '{}'::jsonb),
    (CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas')
) RETURNING id::int AS id;
