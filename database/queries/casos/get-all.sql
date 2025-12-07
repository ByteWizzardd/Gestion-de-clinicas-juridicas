-- Obtener todos los casos con información del cliente
-- Incluye JOIN para obtener nombres completos y datos del cliente
-- Ordenado por id_caso descendente (más recientes primero)
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
    cl.nombres || ' ' || cl.apellidos AS nombre_completo_cliente
FROM casos c
INNER JOIN clientes cl ON c.cedula_cliente = cl.cedula
ORDER BY c.id_caso DESC;

