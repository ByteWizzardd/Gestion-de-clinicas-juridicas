-- Obtener información de un caso eliminado específico
-- Parámetros: $1 = caso_eliminado (id_caso)
SELECT 
    a.id,
    a.caso_eliminado,
    a.fecha_solicitud,
    a.fecha_inicio_caso,
    a.fecha_fin_caso,
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
    a.fecha
FROM public.auditoria_eliminacion_casos a
LEFT JOIN public.usuarios u ON a.eliminado_por = u.cedula
LEFT JOIN public.solicitantes s ON a.cedula_solicitante = s.cedula
LEFT JOIN public.nucleos n ON a.id_nucleo = n.id_nucleo
LEFT JOIN public.materias m ON a.id_materia = m.id_materia
LEFT JOIN public.categorias c ON a.id_materia = c.id_materia AND a.num_categoria = c.num_categoria
LEFT JOIN public.subcategorias sc ON a.id_materia = sc.id_materia AND a.num_categoria = sc.num_categoria AND a.num_subcategoria = sc.num_subcategoria
LEFT JOIN public.ambitos_legales al ON a.id_materia = al.id_materia AND a.num_categoria = al.num_categoria AND a.num_subcategoria = al.num_subcategoria AND a.num_ambito_legal = al.num_ambito_legal
WHERE a.caso_eliminado = $1;
