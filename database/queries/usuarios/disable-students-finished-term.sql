-- Deshabilitar estudiantes de semestres finalizados (fecha_fin < fecha actual)
UPDATE estudiantes e
SET habilitado = FALSE
FROM semestres s
WHERE e.term = s.term
  AND s.fecha_fin < CURRENT_DATE
  AND e.habilitado = TRUE;
