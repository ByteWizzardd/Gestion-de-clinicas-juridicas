-- Buscar solicitantes por cédula (búsqueda parcial)
-- Un solicitante es un cliente que tiene al menos un caso registrado
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    c.cedula,
    c.nombres,
    c.apellidos,
    c.nombres || ' ' || c.apellidos AS nombre_completo
FROM clientes c
WHERE c.cedula LIKE '%' || $1 || '%'
  AND EXISTS (
      SELECT 1 FROM casos ca WHERE ca.cedula_cliente = c.cedula
  )
ORDER BY c.cedula
LIMIT 10;

