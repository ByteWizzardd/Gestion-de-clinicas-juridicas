-- Obtener casos de un solicitante con filtro de fechas opcional
-- Parámetros:
-- $1 = cedula
-- $2 = fecha_inicio (puede ser NULL)
-- $3 = fecha_fin (puede ser NULL)

SELECT * FROM view_casos_detalle
WHERE cedula = $1
  AND ($2::date IS NULL OR fecha_inicio_caso >= $2)
  AND ($3::date IS NULL OR fecha_inicio_caso <= $3)
ORDER BY fecha_inicio_caso DESC;
