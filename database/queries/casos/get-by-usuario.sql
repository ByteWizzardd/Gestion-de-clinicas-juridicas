-- Obtener todos los casos donde el usuario está asignado (se_le_asigna)
-- Solo incluye casos donde el usuario está asignado como estudiante
-- Usa la vista view_casos_detalle para obtener información completa
-- Incluye LEFT JOIN LATERAL para obtener el profesor responsable (supervisor)
-- Parámetros: $1 = cedula_usuario

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
    prof.nombre_completo_profesor AS nombre_responsable
FROM se_le_asigna sla
INNER JOIN view_casos_detalle vc ON sla.id_caso = vc.id_caso
LEFT JOIN LATERAL (
    SELECT 
        u.nombres || ' ' || u.apellidos AS nombre_completo_profesor
    FROM supervisa s
    INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
    INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
    INNER JOIN semestres sem ON p.term = sem.term
    WHERE s.id_caso = vc.id_caso
      AND s.habilitado = true
    ORDER BY sem.fecha_inicio DESC, s.term DESC
    LIMIT 1
) prof ON true
WHERE 
    sla.cedula_estudiante = $1
    AND sla.habilitado = true
ORDER BY vc.fecha_inicio_caso DESC, vc.id_caso DESC;
