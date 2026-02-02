-- Obtener todas las actualizaciones de beneficiarios con filtros opcionales
-- Parámetros:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario (VARCHAR, opcional)
-- $4 = busqueda (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT
    aa.id,
    aa.num_beneficiario,
    aa.id_caso,
    
    aa.cedula_anterior, aa.nombres_anterior, aa.apellidos_anterior, 
    to_char(aa.fecha_nacimiento_anterior, 'YYYY-MM-DD') as fecha_nacimiento_anterior, aa.sexo_anterior, aa.tipo_beneficiario_anterior, aa.parentesco_anterior,
    
    aa.cedula_nuevo, aa.nombres_nuevo, aa.apellidos_nuevo, 
    to_char(aa.fecha_nacimiento_nuevo, 'YYYY-MM-DD') as fecha_nacimiento_nuevo, aa.sexo_nuevo, aa.tipo_beneficiario_nuevo, aa.parentesco_nuevo,
    
    aa.id_usuario_actualizo,
    u.nombres as nombre_usuario,
    u.apellidos as apellido_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre_completo,
    to_char(aa.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_actualizacion
FROM auditoria_actualizacion_beneficiarios aa
LEFT JOIN usuarios u ON aa.id_usuario_actualizo = u.cedula
LEFT JOIN casos c ON aa.id_caso = c.id_caso
WHERE 
    ($1::DATE IS NULL OR aa.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR aa.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR aa.id_usuario_actualizo = $3)
    AND ($4::VARCHAR IS NULL OR (
        aa.nombres_nuevo ILIKE '%' || $4 || '%' OR 
        aa.apellidos_nuevo ILIKE '%' || $4 || '%' OR 
        aa.cedula_nuevo ILIKE '%' || $4 || '%' OR
        aa.nombres_anterior ILIKE '%' || $4 || '%' OR
        aa.apellidos_anterior ILIKE '%' || $4 || '%' OR
        aa.cedula_anterior ILIKE '%' || $4 || '%'
    ))
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN aa.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN aa.fecha_actualizacion END ASC NULLS FIRST;

