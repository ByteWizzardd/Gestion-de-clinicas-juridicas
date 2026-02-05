-- Obtener todos los casos con información del solicitante y profesor responsable
-- Usa la vista view_casos_completo para obtener estatus y cant_beneficiarios derivados
-- Ordenado por id_caso descendente (más recientes primero)
SELECT 
    vc.id_caso,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.fecha_solicitud,
    vc.tramite,
    vc.estatus,
    vc.cant_beneficiarios,
    vc.observaciones,
    vc.id_nucleo,
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.cedula,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    TRIM(REGEXP_REPLACE(vc.nombre_materia, '^\s*Materia\s+', '', 'i')) AS nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    vc.nombre_subcategoria,
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
    ) AS nombre_responsable,
    -- Obtener lista de semestres donde ocurre el caso
    (
        SELECT array_agg(oe.term ORDER BY oe.term DESC)
        FROM ocurren_en oe
        WHERE oe.id_caso = vc.id_caso
    ) AS semestres
FROM view_casos_detalle vc
ORDER BY vc.id_caso DESC;

