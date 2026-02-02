-- Obtener todos los soportes creados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_subio (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en nombre_archivo, descripcion
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.num_soporte,
    a.id_caso,
    a.nombre_archivo,
    a.tipo_mime,
    a.descripcion,
    to_char(a.fecha_consignacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_consignacion,
    a.tamano_bytes,
    to_char(a.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_creacion,
    a.id_usuario_subio,
    u.nombres AS nombres_usuario_subio,
    u.apellidos AS apellidos_usuario_subio,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_subio,
    u.foto_perfil AS foto_perfil_usuario_subio
FROM public.auditoria_insercion_soportes a
LEFT JOIN public.usuarios u ON a.id_usuario_subio = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_subio = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.nombre_archivo ILIKE '%' || $4 || '%'
        OR a.descripcion ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
