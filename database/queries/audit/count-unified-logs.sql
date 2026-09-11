-- Contar logs unificados de auditoría (mismo WHERE que get-unified-logs.sql, sin ORDER/LIMIT)
-- Sesiones, reportes y descargas de soportes ya viven en auditoria_eventos —
-- ver get-unified-logs.sql.
SELECT COUNT(*) FROM auditoria_eventos t
WHERE
    ($1::text IS NULL OR t.entidad = $1) AND
    ($2::text IS NULL OR t.id_usuario = $2) AND
    ($3::text IS NULL OR t.operacion = $3) AND
    ($4::timestamp IS NULL OR t.fecha_evento >= $4) AND
    ($5::timestamp IS NULL OR t.fecha_evento <= $5) AND
    ($6::text IS NULL OR (
        TRANSLATE(COALESCE((SELECT nombres || ' ' || apellidos FROM usuarios WHERE cedula = t.id_usuario), t.id_usuario), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_nuevos::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%' OR
        TRANSLATE(COALESCE(t.datos_anteriores::text, ''), 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') ILIKE '%' || TRANSLATE($6, 'áéíóúÁÉÍÓÚäëïöüÄËÏÖÜ', 'aeiouAEIOUaeiouAEIOU') || '%'
    )) AND
    ($7::text IS NULL OR t.metadata->>'tx_id' = $7) AND
    ($8::text IS NULL OR t.id_transaccion::text = $8);
