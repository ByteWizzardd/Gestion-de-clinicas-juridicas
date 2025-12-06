--Retorna los clientes que son solicitantes en al menos un caso

SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.telefono_celular,
    (
        SELECT fecha_solicitud FROM casos ca WHERE ca.cedula_cliente = c.cedula 
        ORDER BY fecha_solicitud DESC
        LIMIT 1
    ) AS fecha_solicitud
FROM clientes c
WHERE EXISTS (
    SELECT 1 FROM casos ca WHERE ca.cedula_cliente = c.cedula
);