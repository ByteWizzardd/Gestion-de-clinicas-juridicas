UPDATE auditoria_sesiones 
SET fecha_cierre = fecha_inicio + CAST($1 AS INTERVAL)
WHERE fecha_cierre IS NULL 
  AND exitoso = true 
  AND (fecha_inicio + CAST($1 AS INTERVAL)) < NOW();
