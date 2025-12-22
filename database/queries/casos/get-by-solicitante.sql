-- Obtener todos los casos de un solicitante específico
-- Usa la vista view_casos_completo para obtener estatus y cant_beneficiarios derivados
-- Parámetros: $1 = cedula (del solicitante)
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
    vc.nombre_nucleo,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria
FROM view_casos_detalle vc
WHERE vc.cedula = $1
ORDER BY vc.fecha_inicio_caso DESC;

