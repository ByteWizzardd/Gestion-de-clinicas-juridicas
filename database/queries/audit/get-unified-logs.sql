-- Obtener logs unificados de auditoría con paginación
-- Devuelve campos crudos (entidad/operacion/id_entidad) para que el frontend
-- genérico pueda buscar la config de la entidad y armar el diff, en vez de
-- strings ya formateados en español.
--
-- Sesiones, reportes y descargas de soportes viven en auditoria_eventos
-- (entidad='sesion'|'reporte'|'soporte') desde la migración
-- 20260910_120000_unificar_sesiones_reportes_soportes_en_auditoria_eventos.sql —
-- ya no hace falta el UNION ALL contra sus tablas viejas.
SELECT
    t.id::text as id,
    t.id_transaccion::text as id_transaccion,
    t.entidad as entidad,
    t.operacion as operacion,
    t.id_entidad as id_entidad,
    t.fecha_evento as fecha,
    t.id_usuario as usuario_id,
    COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario) as usuario_nombre,
    -- Para eventos de 'caso', resolver el nombre del solicitante (columna
    -- `cedula` cruda en datos_nuevos/datos_anteriores) — el frontend no
    -- puede hacer este JOIN por su cuenta.
    (CASE WHEN t.entidad = 'caso' THEN
        (SELECT nombres || ' ' || apellidos FROM solicitantes
         WHERE cedula = COALESCE(t.datos_nuevos->>'cedula', t.datos_anteriores->>'cedula'))
    END) as solicitante_nombre,
    t.datos_anteriores as datos_anteriores,
    t.datos_nuevos as datos_nuevos,
    t.metadata as metadata
FROM auditoria_eventos t
WHERE
    ($3::text IS NULL OR t.entidad = $3) AND
    ($4::text IS NULL OR t.id_usuario = $4) AND
    ($5::text IS NULL OR t.operacion = $5) AND
    ($6::timestamp IS NULL OR t.fecha_evento >= $6) AND
    ($7::timestamp IS NULL OR t.fecha_evento <= $7) AND
    ($8::text IS NULL OR (
        TRANSLATE(COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_nuevos::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_anteriores::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($8, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    )) AND
    ($9::text IS NULL OR t.metadata->>'tx_id' = $9) AND
    ($10::text IS NULL OR t.id_transaccion::text = $10)
ORDER BY t.fecha_evento DESC
LIMIT $1 OFFSET $2;
