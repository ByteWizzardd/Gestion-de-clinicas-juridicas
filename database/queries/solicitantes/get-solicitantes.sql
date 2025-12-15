-- Retorna los clientes que son solicitantes
-- Un solicitante es un cliente que tiene todos los datos completos requeridos por el formulario:
-- estado_civil, concubinato, id_hogar, id_nivel_educativo, id_trabajo, id_vivienda
-- Y que tiene al menos un caso registrado (fecha_solicitud NOT NULL)

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
WHERE c.estado_civil IS NOT NULL
  AND c.concubinato IS NOT NULL
  AND c.id_hogar IS NOT NULL
  AND c.id_nivel_educativo IS NOT NULL
  AND c.id_trabajo IS NOT NULL
  AND c.id_vivienda IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM casos ca WHERE ca.cedula_cliente = c.cedula
  );