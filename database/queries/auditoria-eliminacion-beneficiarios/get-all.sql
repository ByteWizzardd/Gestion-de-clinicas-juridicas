-- Obtener todas las eliminaciones de beneficiarios con filtros opcionales
-- Parámetros:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario (VARCHAR, opcional)
-- $4 = busqueda (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT
    ae.id,
    ae.num_beneficiario,
    ae.cedula,
    ae.nombres,
    ae.apellidos,
    ae.id_caso,
    ae.id_usuario_elimino,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    ae.fecha_eliminacion,
    ae.fecha_nacimiento,
    ae.sexo,
    ae.tipo_beneficiario,
    ae.parentesco
FROM auditoria_eliminacion_beneficiarios ae
LEFT JOIN usuarios u ON ae.id_usuario_elimino = u.cedula
LEFT JOIN casos c ON ae.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR ae.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR ae.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR ae.id_usuario_elimino = $3)
    AND ($4::VARCHAR IS NULL OR (
        ae.nombres ILIKE '%' || $4 || '%' OR 
        ae.apellidos ILIKE '%' || $4 || '%' OR 
        ae.cedula ILIKE '%' || $4 || '%'
    ))
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN ae.fecha_eliminacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN ae.fecha_eliminacion END ASC NULLS FIRST;

