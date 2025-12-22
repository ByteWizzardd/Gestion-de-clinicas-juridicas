-- Obtener todos los casos asociados a un solicitante
-- Usa la vista view_casos_completo para obtener estatus y cant_beneficiarios derivados
-- Parámetros: $1 = cedula (del solicitante)
SELECT 
    vc.id_caso,
    vc.fecha_solicitud,
    vc.fecha_inicio_caso,
    vc.fecha_fin_caso,
    vc.tramite,
    vc.estatus,
    vc.cant_beneficiarios,
    vc.observaciones,
    vc.nombre_nucleo,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria
FROM view_casos_detalle vc
WHERE vc.cedula = $1
ORDER BY vc.fecha_solicitud DESC, vc.id_caso DESC;

