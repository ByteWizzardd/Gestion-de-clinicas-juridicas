-- Obtener todas las actualizaciones de subcategorias con filtros opcionales
SELECT 
    a.id,
    a.id_materia,
    a.num_categoria,
    a.num_subcategoria,
    a.nombre_subcategoria_anterior,
    a.nombre_subcategoria_nuevo,
    a.habilitado_anterior,
    a.habilitado_nuevo,
    a.id_materia_anterior,
    a.id_materia_nuevo,
    a.num_categoria_anterior,
    a.num_categoria_nuevo,
    c.nombre_categoria AS nombre_categoria_nuevo,
    c_anterior.nombre_categoria AS nombre_categoria_anterior,
    REPLACE(m.nombre_materia, 'Materia ', '') AS nombre_materia_nuevo,
    REPLACE(m_anterior.nombre_materia, 'Materia ', '') AS nombre_materia_anterior,
    
    to_char(a.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM auditoria_actualizacion_subcategorias a
LEFT JOIN usuarios u ON a.id_usuario_actualizo = u.cedula
LEFT JOIN categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
LEFT JOIN categorias c_anterior ON a.id_materia_anterior = c_anterior.id_materia AND a.num_categoria_anterior = c_anterior.num_categoria
LEFT JOIN materias m ON a.id_materia = m.id_materia
LEFT JOIN materias m_anterior ON a.id_materia_anterior = m_anterior.id_materia
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_actualizo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.id_materia::TEXT ILIKE '%' || $4 || '%'
        OR a.num_categoria::TEXT ILIKE '%' || $4 || '%'
        OR a.num_subcategoria::TEXT ILIKE '%' || $4 || '%'
        OR a.nombre_subcategoria_anterior ILIKE '%' || $4 || '%'
        OR a.nombre_subcategoria_nuevo ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
