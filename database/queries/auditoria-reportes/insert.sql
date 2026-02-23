-- Insertar un registro de auditoría de reporte generado
-- Parámetros:
-- $1 = tipo_reporte (VARCHAR) - Identificador del tipo de reporte
-- $2 = descripcion (TEXT) - Descripción legible del reporte
-- $3 = filtros_aplicados (JSONB) - Filtros usados en formato JSON
-- $4 = id_usuario_genero (VARCHAR) - Cédula del usuario que generó
-- $5 = formato (VARCHAR) - Formato del reporte (PDF, Excel, etc.)
-- $6 = cedula_solicitante (VARCHAR, opcional) - Para reportes específicos de solicitante
-- $7 = operacion (VARCHAR, opcional) - 'generacion' o 'vista_previa' (default: 'generacion')
INSERT INTO auditoria_reportes (
    tipo_reporte,
    filtros_aplicados,
    id_usuario_genero,
    formato,
    cedula_solicitante,
    operacion,
    fecha_generacion
) VALUES (
    $1, $2, $3, $4, $5, COALESCE($6, 'generacion'), CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'
) RETURNING id;
