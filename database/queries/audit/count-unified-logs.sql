-- Contar logs unificados de auditoría (mismo WHERE que get-unified-logs.sql, sin ORDER/LIMIT)
SELECT COUNT(*) FROM (
    SELECT t.entidad as entidad, t.operacion as operacion, t.fecha_evento as fecha,
           t.id_usuario as usuario_id,
           t.id_transaccion::text as id_transaccion, t.metadata as metadata,
           COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario) as usuario_nombre,
           t.datos_anteriores as datos_anteriores, t.datos_nuevos as datos_nuevos
    FROM auditoria_eventos t

    UNION ALL

    SELECT 'sesion' as entidad,
           CASE
               WHEN t.fecha_cierre IS NOT NULL THEN 'cierre_sesion'
               WHEN t.exitoso = FALSE THEN 'intento_fallido'
               ELSE 'inicio_sesion'
           END as operacion,
           NULL::text as id_transaccion, NULL::jsonb as metadata,
           COALESCE(t.fecha_inicio, t.fecha_cierre) as fecha,
           t.cedula_usuario as usuario_id,
           COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_usuario), t.cedula_usuario) as usuario_nombre,
           NULL::jsonb as datos_anteriores, to_jsonb(t.*) as datos_nuevos
    FROM auditoria_sesiones t

    UNION ALL

    SELECT 'reporte' as entidad,
           CASE WHEN t.operacion = 'vista_previa' THEN 'vista_previa_reporte' ELSE 'generacion_reporte' END as operacion,
           NULL::text as id_transaccion, NULL::jsonb as metadata,
           t.fecha_generacion as fecha,
           t.id_usuario_genero as usuario_id,
           COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_genero), t.id_usuario_genero) as usuario_nombre,
           NULL::jsonb as datos_anteriores, to_jsonb(t.*) as datos_nuevos
    FROM auditoria_reportes t

    UNION ALL

    SELECT 'soporte' as entidad, 'descarga_soporte' as operacion,
           NULL::text as id_transaccion, NULL::jsonb as metadata,
           t.fecha_descarga as fecha, t.cedula_descargo as usuario_id,
           COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_descargo), t.cedula_descargo) as usuario_nombre,
           NULL::jsonb as datos_anteriores, to_jsonb(t.*) as datos_nuevos
    FROM auditoria_descarga_soportes t
) AS unified_logs
WHERE
    ($1::text IS NULL OR entidad = $1) AND
    ($2::text IS NULL OR usuario_id = $2) AND
    ($3::text IS NULL OR operacion = $3) AND
    ($4::timestamp IS NULL OR fecha >= $4) AND
    ($5::timestamp IS NULL OR fecha <= $5) AND
    ($6::text IS NULL OR (
        TRANSLATE(usuario_nombre, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(datos_nuevos::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(datos_anteriores::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    )) AND
    ($7::text IS NULL OR metadata->>'tx_id' = $7) AND
    ($8::text IS NULL OR id_transaccion = $8);
