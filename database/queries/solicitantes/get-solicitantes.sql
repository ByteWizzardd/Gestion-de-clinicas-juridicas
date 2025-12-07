--Retorna los clientes que son solicitantes en al menos un caso

SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.telefono_celular,
    (
        SELECT n.nombre_nucleo 
        FROM nucleos n 
        WHERE n.id_nucleo = (
            SELECT ca.id_nucleo FROM casos ca WHERE ca.cedula_cliente = c.cedula 
            LIMIT 1
        )
        LIMIT 1
    ) AS nucleo,
    (
        SELECT fecha_solicitud FROM casos ca WHERE ca.cedula_cliente = c.cedula 
        ORDER BY fecha_solicitud DESC
        LIMIT 1
    ) AS fecha_solicitud
FROM clientes c
WHERE EXISTS (
    SELECT 1 FROM casos ca WHERE ca.cedula_cliente = c.cedula
);