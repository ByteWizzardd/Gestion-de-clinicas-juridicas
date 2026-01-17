-- Obtener un caso por ID con información completa
-- Usa la vista view_casos_detalle para obtener estatus y cant_beneficiarios derivados
-- Parámetros: $1 = id_caso
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
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    -- Nombre del ámbito legal
    al.nombre_ambito_legal,
    -- Dirección de habitación del solicitante (para PDF/Excel)
    s.direccion_habitacion,
    -- Responsable del caso (estudiante asignado)
    COALESCE(
        (SELECT u.nombres || ' ' || u.apellidos
         FROM se_le_asigna sa
         INNER JOIN estudiantes e ON sa.term = e.term AND sa.cedula_estudiante = e.cedula_estudiante
         INNER JOIN usuarios u ON e.cedula_estudiante = u.cedula
         WHERE sa.id_caso = vc.id_caso AND sa.habilitado = TRUE
         LIMIT 1),
        'Sin asignar'
    ) AS nombre_responsable
FROM view_casos_detalle vc
LEFT JOIN ambitos_legales al ON vc.id_materia = al.id_materia
    AND vc.num_categoria = al.num_categoria
    AND vc.num_subcategoria = al.num_subcategoria
    AND vc.num_ambito_legal = al.num_ambito_legal
LEFT JOIN solicitantes s ON vc.cedula = s.cedula
WHERE vc.id_caso = $1;

