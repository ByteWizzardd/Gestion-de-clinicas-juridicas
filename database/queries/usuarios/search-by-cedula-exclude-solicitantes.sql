-- Buscar usuarios por cédula (búsqueda parcial) excluyendo solicitantes
-- Un solicitante es una persona que existe en la tabla solicitantes
-- Parámetro: $1 = parte de la cédula a buscar
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.telefono_celular,
    u.correo_electronico,
    u.nombres || ' ' || u.apellidos AS nombre_completo
FROM usuarios u
WHERE u.cedula LIKE '%' || $1 || '%'
  AND u.habilitado_sistema = true
  AND NOT EXISTS (
      SELECT 1 FROM solicitantes s WHERE s.cedula = u.cedula
  )
ORDER BY u.cedula
LIMIT 10;

