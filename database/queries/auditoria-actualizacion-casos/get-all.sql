-- Obtener todas las actualizaciones de casos incluyendo cambios de estatus
-- Combina la tabla auditoria_actualizacion_casos con cambio_estatus
-- Parámetros opcionales:
-- $1 = fecha_inicio (DATE, opcional)
-- $2 = fecha_fin (DATE, opcional)
-- $3 = id_caso (INTEGER, opcional)
-- $4 = id_usuario_actualizo (VARCHAR, opcional)
-- $5 = orden (TEXT, opcional) - 'asc' o 'desc' (por defecto 'desc')

-- CTE para combinar ambas fuentes de auditoría
WITH actualizaciones_combinadas AS (
    -- Actualizaciones de campos del caso (tabla auditoria_actualizacion_casos)
    SELECT 
        a.id,
        a.id_caso,
        'actualizacion_campos'::TEXT AS tipo_cambio,
        a.fecha_actualizacion,
        a.id_usuario_actualizo,
        -- Campos de actualización de caso
        a.fecha_solicitud_anterior, a.fecha_solicitud_nuevo,
        a.fecha_inicio_caso_anterior, a.fecha_inicio_caso_nuevo,
        a.fecha_fin_caso_anterior, a.fecha_fin_caso_nuevo,
        a.tramite_anterior, a.tramite_nuevo,
        a.observaciones_anterior, a.observaciones_nuevo,
        a.id_nucleo_anterior, a.id_nucleo_nuevo,
        a.cedula_solicitante_anterior, a.cedula_solicitante_nuevo,
        a.id_materia_anterior, a.id_materia_nuevo,
        a.num_categoria_anterior, a.num_categoria_nuevo,
        a.num_subcategoria_anterior, a.num_subcategoria_nuevo,
        a.num_ambito_legal_anterior, a.num_ambito_legal_nuevo,
        -- Campos de cambio de estatus (NULL para actualizaciones de campos)
        NULL::VARCHAR(50) AS estatus_anterior,
        NULL::VARCHAR(50) AS estatus_nuevo,
        NULL::TEXT AS motivo
    FROM public.auditoria_actualizacion_casos a
    
    UNION ALL
    
    -- Cambios de estatus (tabla cambio_estatus) - excepto el primero de cada caso
    SELECT 
        ce.num_cambio AS id,
        ce.id_caso,
        'cambio_estatus'::TEXT AS tipo_cambio,
        ce.fecha AS fecha_actualizacion,

        ce.id_usuario_cambia AS id_usuario_actualizo,
        -- Campos de actualización de caso (NULL para cambios de estatus)
        NULL::DATE AS fecha_solicitud_anterior, NULL::DATE AS fecha_solicitud_nuevo,
        NULL::DATE AS fecha_inicio_caso_anterior, NULL::DATE AS fecha_inicio_caso_nuevo,
        NULL::DATE AS fecha_fin_caso_anterior, NULL::DATE AS fecha_fin_caso_nuevo,
        NULL::VARCHAR(200) AS tramite_anterior, NULL::VARCHAR(200) AS tramite_nuevo,
        NULL::TEXT AS observaciones_anterior, NULL::TEXT AS observaciones_nuevo,
        NULL::INTEGER AS id_nucleo_anterior, NULL::INTEGER AS id_nucleo_nuevo,
        NULL::VARCHAR(20) AS cedula_solicitante_anterior, NULL::VARCHAR(20) AS cedula_solicitante_nuevo,
        NULL::INTEGER AS id_materia_anterior, NULL::INTEGER AS id_materia_nuevo,
        NULL::INTEGER AS num_categoria_anterior, NULL::INTEGER AS num_categoria_nuevo,
        NULL::INTEGER AS num_subcategoria_anterior, NULL::INTEGER AS num_subcategoria_nuevo,
        NULL::INTEGER AS num_ambito_legal_anterior, NULL::INTEGER AS num_ambito_legal_nuevo,
        -- Estatus anterior y nuevo usando subquery
        (
            SELECT prev.nuevo_estatus 
            FROM public.cambio_estatus prev 
            WHERE prev.id_caso = ce.id_caso 
              AND prev.num_cambio < ce.num_cambio
            ORDER BY prev.num_cambio DESC
            LIMIT 1
        ) AS estatus_anterior,

        ce.nuevo_estatus AS estatus_nuevo,
        ce.motivo
    FROM public.cambio_estatus ce
    -- Solo incluir cambios que no son el primero (num_cambio > 1 significa que hay un estatus anterior)
    WHERE ce.num_cambio > 1
)
SELECT 
    ac.id,
    ac.id_caso,
    ac.tipo_cambio,
    to_char(ac.fecha_actualizacion, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_actualizacion,
    ac.id_usuario_actualizo,
    -- Campos de actualización
    to_char(ac.fecha_solicitud_anterior, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_solicitud_anterior,
    to_char(ac.fecha_solicitud_nuevo, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_solicitud_nuevo,
    to_char(ac.fecha_inicio_caso_anterior, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_inicio_caso_anterior,
    to_char(ac.fecha_inicio_caso_nuevo, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_inicio_caso_nuevo,
    to_char(ac.fecha_fin_caso_anterior, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_fin_caso_anterior,
    to_char(ac.fecha_fin_caso_nuevo, 'YYYY-MM-DD"T"HH24:MI:SS') as fecha_fin_caso_nuevo,
    ac.tramite_anterior, ac.tramite_nuevo,
    ac.observaciones_anterior, ac.observaciones_nuevo,
    ac.id_nucleo_anterior, ac.id_nucleo_nuevo,
    n_ant.nombre_nucleo AS nombre_nucleo_anterior,
    n_nue.nombre_nucleo AS nombre_nucleo_nuevo,
    ac.cedula_solicitante_anterior, ac.cedula_solicitante_nuevo,
    ac.id_materia_anterior, ac.id_materia_nuevo,
    m_ant.nombre_materia AS nombre_materia_anterior,
    m_nue.nombre_materia AS nombre_materia_nuevo,
    ac.num_categoria_anterior, ac.num_categoria_nuevo,
    c_ant.nombre_categoria AS nombre_categoria_anterior,
    c_nue.nombre_categoria AS nombre_categoria_nuevo,
    ac.num_subcategoria_anterior, ac.num_subcategoria_nuevo,
    sc_ant.nombre_subcategoria AS nombre_subcategoria_anterior,
    sc_nue.nombre_subcategoria AS nombre_subcategoria_nuevo,
    ac.num_ambito_legal_anterior, ac.num_ambito_legal_nuevo,
    al_ant.nombre_ambito_legal AS nombre_ambito_legal_anterior,
    al_nue.nombre_ambito_legal AS nombre_ambito_legal_nuevo,
    -- Campos de cambio de estatus
    ac.estatus_anterior,
    ac.estatus_nuevo,
    ac.motivo,
    -- Usuario que realizó el cambio
    u.nombres AS nombres_usuario_actualizo,
    u.apellidos AS apellidos_usuario_actualizo,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_actualizo,
    u.foto_perfil AS foto_perfil_usuario_actualizo
FROM actualizaciones_combinadas ac
LEFT JOIN public.usuarios u ON ac.id_usuario_actualizo = u.cedula
-- Joins para valores anteriores
LEFT JOIN public.nucleos n_ant ON ac.id_nucleo_anterior = n_ant.id_nucleo
LEFT JOIN public.materias m_ant ON ac.id_materia_anterior = m_ant.id_materia
LEFT JOIN public.categorias c_ant ON ac.id_materia_anterior = c_ant.id_materia AND ac.num_categoria_anterior = c_ant.num_categoria
LEFT JOIN public.subcategorias sc_ant ON ac.id_materia_anterior = sc_ant.id_materia AND ac.num_categoria_anterior = sc_ant.num_categoria AND ac.num_subcategoria_anterior = sc_ant.num_subcategoria
LEFT JOIN public.ambitos_legales al_ant ON ac.id_materia_anterior = al_ant.id_materia AND ac.num_categoria_anterior = al_ant.num_categoria AND ac.num_subcategoria_anterior = al_ant.num_subcategoria AND ac.num_ambito_legal_anterior = al_ant.num_ambito_legal
-- Joins para valores nuevos
LEFT JOIN public.nucleos n_nue ON ac.id_nucleo_nuevo = n_nue.id_nucleo
LEFT JOIN public.materias m_nue ON ac.id_materia_nuevo = m_nue.id_materia
LEFT JOIN public.categorias c_nue ON ac.id_materia_nuevo = c_nue.id_materia AND ac.num_categoria_nuevo = c_nue.num_categoria
LEFT JOIN public.subcategorias sc_nue ON ac.id_materia_nuevo = sc_nue.id_materia AND ac.num_categoria_nuevo = sc_nue.num_categoria AND ac.num_subcategoria_nuevo = sc_nue.num_subcategoria
LEFT JOIN public.ambitos_legales al_nue ON ac.id_materia_nuevo = al_nue.id_materia AND ac.num_categoria_nuevo = al_nue.num_categoria AND ac.num_subcategoria_nuevo = al_nue.num_subcategoria AND ac.num_ambito_legal_nuevo = al_nue.num_ambito_legal
WHERE 
    ($1::DATE IS NULL OR ac.fecha_actualizacion::DATE >= $1)
    AND ($2::DATE IS NULL OR ac.fecha_actualizacion::DATE <= $2)
    AND ($3::INTEGER IS NULL OR ac.id_caso = $3)
    AND ($4::VARCHAR IS NULL OR ac.id_usuario_actualizo = $4)
ORDER BY 
    CASE WHEN ($5::TEXT IS NULL OR $5::TEXT = 'desc') THEN ac.fecha_actualizacion END DESC NULLS LAST,
    CASE WHEN $5::TEXT = 'asc' THEN ac.fecha_actualizacion END ASC NULLS FIRST;

