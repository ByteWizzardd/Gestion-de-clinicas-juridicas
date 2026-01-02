-- Obtener una cita específica por num_cita e id_caso
-- Parámetros:
--   $1 = num_cita
--   $2 = id_caso
SELECT
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion
FROM citas c
WHERE c.num_cita = $1::INTEGER
  AND c.id_caso = $2::INTEGER;