-- Obtener todos los ambitos legales eliminados con filtros opcionales
SELECT 
    a.id,
    a.id_materia,
    a.num_categoria,
    a.num_subcategoria,
    a.num_ambito_legal,
    a.nombre_ambito_legal,
    a.habilitado,
    
    a.fecha_eliminacion,
    a.id_usuario_elimino,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    u.foto_perfil AS foto_perfil_usuario_elimino,
    a.motivo
FROM auditoria_eliminacion_ambitos_legales a
LEFT JOIN usuarios u ON a.id_usuario_elimino = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_eliminacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_eliminacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_elimino = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_materia::TEXT ILIKE '%' || $4 || '%'
        OR a.num_categoria::TEXT ILIKE '%' || $4 || '%'
        OR a.num_subcategoria::TEXT ILIKE '%' || $4 || '%'
        OR a.num_ambito_legal::TEXT ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_eliminacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_eliminacion END ASC NULLS FIRST;
