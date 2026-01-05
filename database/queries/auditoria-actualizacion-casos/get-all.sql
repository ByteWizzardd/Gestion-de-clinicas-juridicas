-- Obtener todas las actualizaciones de casos con filtros opcionales
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_caso (INTEGER, opcional)
-- $4 = id_usuario_actualizo (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')
SELECT 
    a.id,
    a.id_caso,
    a.fecha_solicitud_anterior, a.fecha_solicitud_nuevo,
    a.fecha_inicio_caso_anterior, a.fecha_inicio_caso_nuevo,
    a.fecha_fin_caso_anterior, a.fecha_fin_caso_nuevo,
    a.tramite_anterior, a.tramite_nuevo,
    a.observaciones_anterior, a.observaciones_nuevo,
    a.id_nucleo_anterior, a.id_nucleo_nuevo,
    n_ant.nombre_nucleo AS nombre_nucleo_anterior,
    n_nue.nombre_nucleo AS nombre_nucleo_nuevo,
    a.cedula_solicitante_anterior, a.cedula_solicitante_nuevo,
    a.id_materia_anterior, a.id_materia_nuevo,
    m_ant.nombre_materia AS nombre_materia_anterior,
    m_nue.nombre_materia AS nombre_materia_nuevo,
    a.num_categoria_anterior, a.num_categoria_nuevo,
    c_ant.nombre_categoria AS nombre_categoria_anterior,
    c_nue.nombre_categoria AS nombre_categoria_nuevo,
    a.num_subcategoria_anterior, a.num_subcategoria_nuevo,
    sc_ant.nombre_subcategoria AS nombre_subcategoria_anterior,
    sc_nue.nombre_subcategoria AS nombre_subcategoria_nuevo,
    a.num_ambito_legal_anterior, a.num_ambito_legal_nuevo,
    al_ant.nombre_ambito_legal AS nombre_ambito_legal_anterior,
    al_nue.nombre_ambito_legal AS nombre_ambito_legal_nuevo,
    a.fecha_actualizacion,
    a.id_usuario_actualizo,
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM public.auditoria_actualizacion_casos a
LEFT JOIN public.usuarios u ON a.id_usuario_actualizo = u.cedula
-- Joins para valores anteriores
LEFT JOIN public.nucleos n_ant ON a.id_nucleo_anterior = n_ant.id_nucleo
LEFT JOIN public.materias m_ant ON a.id_materia_anterior = m_ant.id_materia
LEFT JOIN public.categorias c_ant ON a.id_materia_anterior = c_ant.id_materia AND a.num_categoria_anterior = c_ant.num_categoria
LEFT JOIN public.subcategorias sc_ant ON a.id_materia_anterior = sc_ant.id_materia AND a.num_categoria_anterior = sc_ant.num_categoria AND a.num_subcategoria_anterior = sc_ant.num_subcategoria
LEFT JOIN public.ambitos_legales al_ant ON a.id_materia_anterior = al_ant.id_materia AND a.num_categoria_anterior = al_ant.num_categoria AND a.num_subcategoria_anterior = al_ant.num_subcategoria AND a.num_ambito_legal_anterior = al_ant.num_ambito_legal
-- Joins para valores nuevos
LEFT JOIN public.nucleos n_nue ON a.id_nucleo_nuevo = n_nue.id_nucleo
LEFT JOIN public.materias m_nue ON a.id_materia_nuevo = m_nue.id_materia
LEFT JOIN public.categorias c_nue ON a.id_materia_nuevo = c_nue.id_materia AND a.num_categoria_nuevo = c_nue.num_categoria
LEFT JOIN public.subcategorias sc_nue ON a.id_materia_nuevo = sc_nue.id_materia AND a.num_categoria_nuevo = sc_nue.num_categoria AND a.num_subcategoria_nuevo = sc_nue.num_subcategoria
LEFT JOIN public.ambitos_legales al_nue ON a.id_materia_nuevo = al_nue.id_materia AND a.num_categoria_nuevo = al_nue.num_categoria AND a.num_subcategoria_nuevo = al_nue.num_subcategoria AND a.num_ambito_legal_nuevo = al_nue.num_ambito_legal
WHERE 
    ($1::DATE IS NULL OR a.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR a.fecha_actualizacion::DATE <= $2)
    AND ($3::INTEGER IS NULL OR a.id_caso = $3)
    AND ($4::VARCHAR IS NULL OR a.id_usuario_actualizo = $4)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN a.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN a.fecha_actualizacion END ASC NULLS FIRST;
