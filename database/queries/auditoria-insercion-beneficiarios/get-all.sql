-- Obtener todas las inserciones de beneficiarios con filtros opcionales
-- Parámetros:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario (VARCHAR, opcional)
-- $4 = busqueda (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT
    ai.id,
    ai.num_beneficiario,
    ai.id_caso,
    ai.cedula,
    ai.nombres,
    ai.apellidos,
    ai.fecha_nacimiento,
    ai.sexo,
    ai.tipo_beneficiario,
    ai.parentesco,
    ai.id_usuario_registro,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    ai.fecha_registro
FROM auditoria_insercion_beneficiarios ai
LEFT JOIN usuarios u ON ai.id_usuario_registro = u.cedula
LEFT JOIN casos c ON ai.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR ai.fecha_registro::DATE >= $1)
    AND ($2::DATE IS NULL OR ai.fecha_registro::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR ai.id_usuario_registro = $3)
    AND ($4::VARCHAR IS NULL OR (
        ai.nombres ILIKE '%' || $4 || '%' OR 
        ai.apellidos ILIKE '%' || $4 || '%' OR 
        ai.cedula ILIKE '%' || $4 || '%'
    ))
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN ai.fecha_registro END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN ai.fecha_registro END ASC NULLS FIRST;

