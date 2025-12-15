-- Buscar clientes por cédula (búsqueda parcial) excluyendo solicitantes
-- Un solicitante es un cliente que tiene al menos un caso registrado
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.fecha_nacimiento,
    c.telefono_celular,
    c.correo_electronico,
    c.sexo,
    c.nacionalidad,
    c.nombres || ' ' || c.apellidos AS nombre_completo
FROM clientes c
WHERE c.cedula LIKE '%' || $1 || '%'
  AND NOT EXISTS (
      SELECT 1 FROM casos ca WHERE ca.cedula_cliente = c.cedula
  )
ORDER BY c.cedula
LIMIT 10;

