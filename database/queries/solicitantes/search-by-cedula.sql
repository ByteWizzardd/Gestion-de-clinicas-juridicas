-- Buscar solicitantes por cédula (búsqueda parcial)
-- Un solicitante es un cliente que tiene todos los datos completos requeridos por el formulario:
-- estado_civil, concubinato, id_hogar, id_nivel_educativo, id_trabajo, id_vivienda
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.nombres || ' ' || c.apellidos AS nombre_completo
FROM clientes c
WHERE c.cedula LIKE '%' || $1 || '%'
  AND c.estado_civil IS NOT NULL
  AND c.concubinato IS NOT NULL
  AND c.id_hogar IS NOT NULL
  AND c.id_nivel_educativo IS NOT NULL
  AND c.id_trabajo IS NOT NULL
  AND c.id_vivienda IS NOT NULL
ORDER BY c.cedula
LIMIT 10;

