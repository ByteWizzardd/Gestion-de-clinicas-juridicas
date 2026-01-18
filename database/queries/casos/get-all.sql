-- Obtener todos los casos con información del solicitante
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
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria,
    vc.nombre_ambito_legal
FROM view_casos_detalle vc
ORDER BY vc.id_caso DESC;

