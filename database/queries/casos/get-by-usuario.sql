-- Obtener todos los casos donde el usuario está asignado (estudiante) o supervisa (profesor)
-- Usa la vista view_casos_detalle para obtener información completa
-- Incluye LEFT JOIN LATERAL para obtener el profesor responsable (supervisor)
-- Parámetros: $1 = cedula_usuario

-- Casos donde el usuario es estudiante asignado
SELECT DISTINCT
    vc.id_caso,
    vc.fecha_solicitud,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.tramite,
    vc.observaciones,
    vc.id_nucleo,
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.cant_beneficiarios,
    vc.cedula AS cedula_solicitante,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    TRIM(REGEXP_REPLACE(vc.nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    'Asignado' AS rol_usuario,
    sla.term,
    vc.estatus,
    -- Obtenemos el nombre del profesor supervisor más reciente mediante subconsulta
    (
        SELECT 
            u.nombres || ' ' || u.apellidos
        FROM supervisa s
        INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
        INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
        INNER JOIN semestres sem ON p.term = sem.term
        WHERE s.id_caso = vc.id_caso
          AND s.habilitado = true
        ORDER BY sem.fecha_inicio DESC, s.term DESC
        LIMIT 1
    ) AS nombre_responsable
FROM se_le_asigna sla
INNER JOIN view_casos_detalle vc ON sla.id_caso = vc.id_caso
WHERE 
    sla.cedula_estudiante = $1
    AND sla.habilitado = true

UNION

-- Casos donde el usuario es profesor supervisor
SELECT DISTINCT
    vc.id_caso,
    vc.fecha_solicitud,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.tramite,
    vc.observaciones,
    vc.id_nucleo,
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.cant_beneficiarios,
    vc.cedula AS cedula_solicitante,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    TRIM(REGEXP_REPLACE(vc.nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    'Supervisor' AS rol_usuario,
    sup.term,
    vc.estatus,
    u_prof.nombres || ' ' || u_prof.apellidos AS nombre_responsable
FROM supervisa sup
INNER JOIN view_casos_detalle vc ON sup.id_caso = vc.id_caso
INNER JOIN usuarios u_prof ON sup.cedula_profesor = u_prof.cedula
WHERE 
    sup.cedula_profesor = $1
    AND sup.habilitado = true

ORDER BY fecha_inicio_caso DESC, id_caso DESC;
