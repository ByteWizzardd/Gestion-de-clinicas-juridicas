-- Contar logs unificados de auditoría
SELECT COUNT(*) FROM (
    -- Eventos Genéricos (auditoria_eventos)
    SELECT
        INITCAP(REGEXP_REPLACE(t.entidad, 's$', '')) as entidad,
        CASE 
            WHEN t.operacion = 'insercion' THEN 'Creación'
            WHEN t.operacion = 'actualizacion' THEN 'Actualización'
            WHEN t.operacion = 'eliminacion' THEN 'Eliminación'
            ELSE t.operacion
        END as accion,
        t.fecha_evento as fecha,
        t.id_usuario as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario) as usuario_nombre,
        'Registro ID: ' || COALESCE(t.id_entidad, 'N/A') as detalles,
        jsonb_build_object(
            'datos_anteriores', t.datos_anteriores,
            'datos_nuevos', t.datos_nuevos,
            'metadata_original', t.metadata
        )::text as metadata
    FROM auditoria_eventos t

    UNION ALL

    -- Sesiones (auditoria_sesiones)
    SELECT
        'Sesión' as entidad,
        CASE 
            WHEN t.fecha_cierre IS NOT NULL THEN 'Cierre de Sesión'
            WHEN t.exitoso = FALSE THEN 'Intento Fallido'
            ELSE 'Inicio de Sesión' 
        END as accion,
        COALESCE(t.fecha_inicio, t.fecha_cierre) as fecha,
        t.cedula_usuario as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_usuario), t.cedula_usuario) as usuario_nombre,
        COALESCE(t.detalle, 'IP: ' || COALESCE(t.ip_direccion::text, 'N/A')) as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_sesiones t

    UNION ALL

    -- Reportes (auditoria_reportes)
    SELECT
        'Reporte' as entidad,
        'Generación' as accion,
        t.fecha_generacion as fecha,
        t.id_usuario_genero as usuario_id,
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario_genero), t.id_usuario_genero) as usuario_nombre,
        'Tipo: ' || t.tipo_reporte as detalles,
        row_to_json(t.*)::text as metadata
    FROM auditoria_reportes t

    UNION ALL

    -- Soportes (Descargas)
    SELECT 
        'Soporte' as entidad, 
        'Descarga' as accion, 
        t.fecha_descarga as fecha, 
        t.cedula_descargo as usuario_id, 
        COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.cedula_descargo), t.cedula_descargo) as usuario_nombre, 
        'Archivo: ' || t.nombre_archivo as detalles, 
        row_to_json(t.*)::text as metadata 
    FROM auditoria_descarga_soportes t
) AS unified_logs
WHERE
    ($1::text IS NULL OR entidad = $1) AND
    ($2::text IS NULL OR usuario_id = $2) AND
    ($3::text IS NULL OR accion ILIKE '%' || $3 || '%') AND
    ($4::timestamp IS NULL OR fecha >= $4) AND
    ($5::timestamp IS NULL OR fecha <= $5) AND
    ($6::text IS NULL OR (
        TRANSLATE(detalles, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR 
        TRANSLATE(usuario_nombre, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR 
        TRANSLATE(accion, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR 
        TRANSLATE(metadata::text, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    ));
