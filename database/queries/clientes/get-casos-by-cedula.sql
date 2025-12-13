-- Obtener todos los casos asociados a un cliente
-- Parámetros: $1 = cedula
SELECT 
    ca.id_caso,
    ca.fecha_solicitud,
    ca.fecha_inicio_caso,
    ca.fecha_fin_caso,
    ca.tramite,
    ca.estatus,
    ca.observaciones,
    n.nombre_nucleo,
    al.materia AS ambito_legal_materia
FROM casos ca
LEFT JOIN nucleos n ON ca.id_nucleo = n.id_nucleo
LEFT JOIN ambitos_legales al ON ca.id_ambito_legal = al.id_ambito_legal
WHERE ca.cedula_cliente = $1
ORDER BY ca.fecha_solicitud DESC, ca.id_caso DESC;

