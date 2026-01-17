-- Obtener todos los usuarios creados con filtros opcionales
-- IMPORTANTE: Los datos vienen de la tabla de auditoría, NO de usuarios/estudiantes/profesores
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_creo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en nombres, apellidos, cedula, correo, nombre_usuario
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.cedula,
    a.nombres,
    a.apellidos,
    a.correo_electronico,
    a.nombre_usuario,
    a.telefono_celular,
    a.habilitado_sistema,
    a.tipo_usuario,
    a.tipo_estudiante,
    a.tipo_profesor,
    a.fecha_creacion,
    a.id_usuario_creo,
    u.nombres AS nombres_usuario_creo,
    u.apellidos AS apellidos_usuario_creo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_creo,
    u.foto_perfil AS foto_perfil_usuario_creo
FROM public.auditoria_insercion_usuarios a
LEFT JOIN public.usuarios u ON a.id_usuario_creo = u.cedula
WHERE 
    ($1::DATE IS NULL OR a.fecha_creacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_creacion::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.id_usuario_creo = $3)
    AND (
        $4::TEXT IS NULL 
        OR a.nombres ILIKE '%' || $4 || '%'
        OR a.apellidos ILIKE '%' || $4 || '%'
        OR a.cedula ILIKE '%' || $4 || '%'
        OR a.correo_electronico ILIKE '%' || $4 || '%'
        OR a.nombre_usuario ILIKE '%' || $4 || '%'
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
