-- Obtener todos los casos de un cliente específico
-- Parámetros: $1 = cedula_cliente
SELECT 
    c.id_caso,
    c.fecha_inicio_caso,
    c.fecha_fin_caso,
    c.fecha_solicitud,
    c.tramite,
    c.estatus,
    c.observaciones,
    c.id_nucleo,
    c.id_ambito_legal,
    c.id_expediente,
    n.nombre_nucleo,
    al.materia AS ambito_legal_materia
FROM casos c
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN ambitos_legales al ON c.id_ambito_legal = al.id_ambito_legal
WHERE c.cedula_cliente = $1
ORDER BY c.fecha_inicio_caso DESC;

