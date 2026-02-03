-- Deshabilitar profesores de semestres finalizados (fecha_fin < fecha actual)
UPDATE profesores p
SET habilitado = FALSE
FROM semestres s
WHERE p.term = s.term
  AND s.fecha_fin < CURRENT_DATE
  AND p.habilitado = TRUE;
