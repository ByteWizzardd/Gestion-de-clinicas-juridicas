-- Obtener todos los caracteristicas insertados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_creo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en num_caracteristica, descripcion
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.num_caracteristica,
    a.descripcion,
    a.id_tipo_caracteristica,
    a.habilitado,
    t.nombre_tipo_caracteristica,
    to_char(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
    a.id_usuario_creo,
    u.nombres AS nombres_usuario_creo,
    u.apellidos AS apellidos_usuario_creo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_creo,
    u.foto_perfil AS foto_perfil_usuario_creo
FROM auditoria_insercion_caracteristicas a
LEFT JOIN usuarios u ON a.id_usuario_creo = u.cedula
LEFT JOIN tipo_caracteristicas t ON a.id_tipo_caracteristica = t.id_tipo
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.num_caracteristica::TEXT ILIKE '%' || $4 || '%'
        OR a.descripcion ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
