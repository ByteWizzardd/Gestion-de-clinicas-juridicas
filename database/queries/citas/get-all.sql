-- Obtiene todas las citas con información relacionada
-- Incluye: caso, solicitante, núcleo, ámbito legal
-- Usa la vista view_casos_completo para obtener estatus derivado
SELECT 
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion,
    c.fecha_registro,
    c.id_usuario_orientacion,
    -- Información del caso (desde vista)
    vc.tramite,
    vc.estatus,
    vc.cedula,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    -- Información del núcleo
    vc.id_nucleo,
    vc.nombre_nucleo,
    -- Información del ámbito legal
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria
FROM citas c
INNER JOIN view_casos_detalle vc ON c.id_caso = vc.id_caso
ORDER BY c.fecha_encuentro DESC;

