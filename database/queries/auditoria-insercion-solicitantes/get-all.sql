-- Obtener todos los solicitantes creados con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_usuario_creo (VARCHAR, opcional)
-- $4 = busqueda (TEXT, opcional) - busca en nombres, apellidos, cedula, correo
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.cedula,
    a.nombres,
    a.apellidos,
    a.fecha_nacimiento,
    a.telefono_local,
    a.telefono_celular,
    a.correo_electronico,
    a.sexo,
    a.nacionalidad,
    a.estado_civil,
    a.concubinato,
    a.tipo_tiempo_estudio,
    a.tiempo_estudio,
    a.id_nivel_educativo,
    ne.descripcion AS nivel_educativo,
    a.id_trabajo,
    ct.nombre_trabajo AS condicion_trabajo,
    a.id_actividad,
    ca.nombre_actividad AS condicion_actividad,
    a.id_estado,
    e.nombre_estado,
    a.num_municipio,
    m.nombre_municipio,
    a.num_parroquia,
    p.nombre_parroquia,
    a.fecha_creacion,
    a.id_usuario_creo,
    u.nombres AS nombres_usuario_creo,
    u.apellidos AS apellidos_usuario_creo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_creo,
    u.foto_perfil AS foto_perfil_usuario_creo
FROM public.auditoria_insercion_solicitantes a
LEFT JOIN public.usuarios u ON a.id_usuario_creo = u.cedula
LEFT JOIN public.niveles_educativos ne ON a.id_nivel_educativo = ne.id_nivel_educativo
LEFT JOIN public.condicion_trabajo ct ON a.id_trabajo = ct.id_trabajo
LEFT JOIN public.condicion_actividad ca ON a.id_actividad = ca.id_actividad
LEFT JOIN public.estados e ON a.id_estado = e.id_estado
LEFT JOIN public.municipios m ON a.id_estado = m.id_estado AND a.num_municipio = m.num_municipio
LEFT JOIN public.parroquias p ON a.id_estado = p.id_estado AND a.num_municipio = p.num_municipio AND a.num_parroquia = p.num_parroquia
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
    )
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_creacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_creacion END ASC NULLS FIRST;
