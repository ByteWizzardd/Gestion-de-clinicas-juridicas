-- Deshabilitar del SISTEMA a los profesores de semestres finalizados (fecha_fin < fecha actual)
-- Solo afecta profesores cuyo usuario esté actualmente habilitado en el sistema
-- Los coordinadores NUNCA se ven afectados (se filtra por tipo_usuario = 'Profesor')
UPDATE usuarios u
SET habilitado_sistema = FALSE
FROM profesores p
JOIN semestres s ON p.term = s.term
WHERE u.cedula = p.cedula_profesor
  AND s.fecha_fin < CURRENT_DATE
  AND u.habilitado_sistema = TRUE
  AND u.tipo_usuario = 'Profesor';
