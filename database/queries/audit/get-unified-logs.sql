-- Obtener logs unificados de auditoría con paginación
-- Devuelve campos crudos (entidad/operacion/id_entidad) para que el frontend
-- genérico pueda buscar la config de la entidad y armar el diff, en vez de
-- strings ya formateados en español.
SELECT * FROM (
    -- Eventos Genéricos (auditoria_eventos)
    SELECT
        t.id::text as id,
        t.id_transaccion::text as id_transaccion,
        t.entidad as entidad,
        t.operacion as operacion,
        t.id_entidad as id_entidad,
        t.fecha_evento as fecha,
        t.id_usuario as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario) as usuario_nombre,
        t.datos_anteriores as datos_anteriores,
        t.datos_nuevos as datos_nuevos,
        t.metadata as metadata
    FROM auditoria_eventos t

    UNION ALL

    -- Sesiones (auditoria_sesiones)
    SELECT
        t.id_sesion::text as id,
        NULL::text as id_transaccion,
        'sesion' as entidad,
        CASE
            WHEN t.fecha_cierre IS NOT NULL THEN 'cierre_sesion'
            WHEN t.exitoso = FALSE THEN 'intento_fallido'
            ELSE 'inicio_sesion'
        END as operacion,
        t.id_sesion::text as id_entidad,
        COALESCE(t.fecha_inicio, t.fecha_cierre) as fecha,
        t.cedula_usuario as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_usuario), t.cedula_usuario) as usuario_nombre,
        NULL::jsonb as datos_anteriores,
        to_jsonb(t.*) as datos_nuevos,
        NULL::jsonb as metadata
    FROM auditoria_sesiones t

    UNION ALL

    -- Reportes (auditoria_reportes)
    SELECT
        t.id::text as id,
        NULL::text as id_transaccion,
        'reporte' as entidad,
        CASE WHEN t.operacion = 'vista_previa' THEN 'vista_previa_reporte' ELSE 'generacion_reporte' END as operacion,
        t.id::text as id_entidad,
        t.fecha_generacion as fecha,
        t.id_usuario_genero as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_genero), t.id_usuario_genero) as usuario_nombre,
        NULL::jsonb as datos_anteriores,
        to_jsonb(t.*) as datos_nuevos,
        NULL::jsonb as metadata
    FROM auditoria_reportes t

    UNION ALL

    -- Soportes (Descargas)
    SELECT
        t.id::text as id,
        NULL::text as id_transaccion,
        'soporte' as entidad,
        'descarga_soporte' as operacion,
        t.num_soporte::text || '-' || t.id_caso::text as id_entidad,
        t.fecha_descarga as fecha,
        t.cedula_descargo as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_descargo), t.cedula_descargo) as usuario_nombre,
        NULL::jsonb as datos_anteriores,
        to_jsonb(t.*) as datos_nuevos,
        NULL::jsonb as metadata
    FROM auditoria_descarga_soportes t
) AS unified_logs
WHERE
    ($3::text IS NULL OR entidad = $3) AND
    ($4::text IS NULL OR usuario_id = $4) AND
    ($5::text IS NULL OR operacion = $5) AND
    ($6::timestamp IS NULL OR fecha >= $6) AND
    ($7::timestamp IS NULL OR fecha <= $7) AND
    ($8::text IS NULL OR (
        TRANSLATE(usuario_nombre, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(datos_nuevos::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(datos_anteriores::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    )) AND
    ($9::text IS NULL OR metadata->>'tx_id' = $9) AND
    ($10::text IS NULL OR id_transaccion = $10)
ORDER BY fecha DESC
LIMIT $1 OFFSET $2;
