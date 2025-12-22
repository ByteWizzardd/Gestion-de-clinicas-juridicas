-- Obtiene todas las citas con información relacionada
-- Incluye: caso, solicitante, núcleo, ámbito legal, y usuario que atendió
-- Usa la vista view_casos_detalle para obtener estatus derivado
-- Usa LEFT JOIN para obtener la información de atienden (puede haber múltiples atenciones)
SELECT 
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion,
    -- Información de la atención (desde atienden)
    a.fecha_registro,
    a.id_usuario AS id_usuario_atencion,
    u.nombres AS nombres_usuario_atencion,
    u.apellidos AS apellidos_usuario_atencion,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_atencion,
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
LEFT JOIN LATERAL (
    SELECT id_usuario, fecha_registro
    FROM atienden
    WHERE atienden.num_cita = c.num_cita 
    AND atienden.id_caso = c.id_caso
    ORDER BY fecha_registro DESC
    LIMIT 1
) a ON true
LEFT JOIN usuarios u ON a.id_usuario = u.cedula
ORDER BY c.fecha_encuentro DESC;

