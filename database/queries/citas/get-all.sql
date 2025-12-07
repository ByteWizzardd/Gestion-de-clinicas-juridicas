-- Obtiene todas las citas con información relacionada
-- Incluye: caso, cliente, núcleo, ámbito legal
SELECT 
    c.fecha_cita,
    c.id_caso,
    c.proxima_cita,
    -- Información del caso
    caso.tramite,
    caso.estatus,
    caso.cedula_cliente,
    -- Información del cliente
    cli.nombres AS nombres_cliente,
    cli.apellidos AS apellidos_cliente,
    -- Información del núcleo
    n.id_nucleo,
    n.nombre_nucleo,
    -- Información del ámbito legal
    al.id_ambito_legal,
    al.materia AS materia_ambito
FROM citas c
INNER JOIN casos caso ON c.id_caso = caso.id_caso
INNER JOIN clientes cli ON caso.cedula_cliente = cli.cedula
INNER JOIN nucleos n ON caso.id_nucleo = n.id_nucleo
INNER JOIN ambitos_legales al ON caso.id_ambito_legal = al.id_ambito_legal
ORDER BY c.fecha_cita DESC;

