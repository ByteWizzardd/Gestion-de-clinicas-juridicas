-- Obtener un caso por ID con información completa
-- Parámetros: $1 = id_caso
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
    c.cedula_cliente,
    cl.nombres AS nombres_cliente,
    cl.apellidos AS apellidos_cliente,
    cl.nombres || ' ' || cl.apellidos AS nombre_completo_cliente,
    n.nombre_nucleo,
    al.materia AS ambito_legal_materia
FROM casos c
INNER JOIN clientes cl ON c.cedula_cliente = cl.cedula
LEFT JOIN nucleos n ON c.id_nucleo = n.id_nucleo
LEFT JOIN ambitos_legales al ON c.id_ambito_legal = al.id_ambito_legal
WHERE c.id_caso = $1;

