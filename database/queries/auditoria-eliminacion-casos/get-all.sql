-- Obtener todas las eliminaciones de casos con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = eliminado_por (VARCHAR, opcional)
-- $4 = cedula_solicitante (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.caso_eliminado,
    to_char(a.fecha_solicitud, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_solicitud,
    to_char(a.fecha_inicio_caso, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_inicio_caso,
    to_char(a.fecha_fin_caso, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_fin_caso,
    a.tramite,
    a.observaciones,
    a.id_nucleo,
    n.nombre_nucleo,
    a.cedula_solicitante,
    s.nombres AS nombres_solicitante,
    s.apellidos AS apellidos_solicitante,
    CONCAT(s.nombres, ' ', s.apellidos) AS nombre_completo_solicitante,
    a.id_materia,
    m.nombre_materia,
    a.num_categoria,
    c.nombre_categoria,
    a.num_subcategoria,
    sc.nombre_subcategoria,
    a.num_ambito_legal,
    al.nombre_ambito_legal AS ambito_legal,
    a.eliminado_por,
    u.nombres AS nombres_usuario_elimino,
    u.apellidos AS apellidos_usuario_elimino,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_elimino,
    a.motivo,
    to_char(a.fecha, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha
FROM public.auditoria_eliminacion_casos a
LEFT JOIN public.usuarios u ON a.eliminado_por = u.cedula
LEFT JOIN public.solicitantes s ON a.cedula_solicitante = s.cedula
LEFT JOIN public.nucleos n ON a.id_nucleo = n.id_nucleo
LEFT JOIN public.materias m ON a.id_materia = m.id_materia
LEFT JOIN public.categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
LEFT JOIN public.subcategorias sc ON a.id_materia = sc.id_materia AND a.num_categoria = sc.num_categoria AND a.num_subcategoria = sc.num_subcategoria
LEFT JOIN public.ambitos_legales al ON a.id_materia = al.id_materia AND a.num_categoria = al.num_categoria AND a.num_subcategoria = al.num_subcategoria AND a.num_ambito_legal = al.num_ambito_legal
WHERE 
    ($1::DATE IS NULL OR a.fecha::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha::DATE <= $2)
    AND ($3::VARCHAR IS NULL OR a.eliminado_por = $3)
    AND ($4::VARCHAR IS NULL OR a.cedula_solicitante = $4)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha END ASC NULLS FIRST;
