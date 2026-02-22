-- Deshabilitar del SISTEMA a los estudiantes de semestres finalizados (fecha_fin < fecha actual)
-- Solo afecta estudiantes cuyo usuario esté actualmente habilitado en el sistema
UPDATE usuarios u
SET habilitado_sistema = FALSE
FROM estudiantes e
JOIN semestres s ON e.term = s.term
WHERE u.cedula = e.cedula_estudiante
  AND s.fecha_fin < CURRENT_DATE
  AND u.habilitado_sistema = TRUE
  AND u.tipo_usuario = 'Estudiante';
