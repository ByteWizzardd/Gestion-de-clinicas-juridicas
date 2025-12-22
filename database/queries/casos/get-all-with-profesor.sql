-- Obtener todos los casos con información del cliente y profesor responsable
-- Incluye JOIN para obtener nombres completos y datos del cliente
-- Incluye LEFT JOIN LATERAL para obtener el profesor responsable activo (optimizado para evitar N+1)
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
    cl.nombres || ' ' || cl.apellidos AS nombre_completo_cliente,
    prof.nombre_completo_profesor AS nombre_responsable
FROM casos c
INNER JOIN clientes cl ON c.cedula_cliente = cl.cedula
LEFT JOIN LATERAL (
    SELECT 
        c_prof.nombres || ' ' || c_prof.apellidos AS nombre_completo_profesor
    FROM asignaciones a
    INNER JOIN clientes c_prof ON a.cedula_profesor = c_prof.cedula
    WHERE a.id_caso = c.id_caso
      AND (a.fecha_fin IS NULL OR a.fecha_fin >= CURRENT_DATE)
    ORDER BY a.fecha_inicio DESC
    LIMIT 1
) prof ON true
ORDER BY c.id_caso DESC;

