-- Obtener todos los casos donde el usuario está asignado (se_le_asigna)
-- Solo incluye casos donde el usuario está asignado como estudiante
-- Usa la vista view_casos_detalle para obtener información completa
-- Parámetros: $1 = cedula_usuario

SELECT DISTINCT
    vc.id_caso,
    vc.fecha_solicitud,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.tramite,
    vc.observaciones,
    vc.id_nucleo,
    vc.cedula AS cedula_solicitante,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    vc.nombre_nucleo,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    'Asignado' AS rol_usuario,
    sla.term,
    vc.estatus
FROM se_le_asigna sla
INNER JOIN view_casos_detalle vc ON sla.id_caso = vc.id_caso
WHERE 
    sla.cedula_estudiante = $1
    AND sla.habilitado = true
ORDER BY vc.fecha_inicio_caso DESC, vc.id_caso DESC;

