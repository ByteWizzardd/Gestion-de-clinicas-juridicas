-- Obtener el profesor responsable activo de un caso específico
-- Retorna el primer profesor con supervisión activa (habilitado = true)
-- Incluye el nombre completo del profesor desde la tabla usuarios
SELECT DISTINCT 
    s.cedula_profesor,
    u.nombres || ' ' || u.apellidos AS nombre_completo_profesor
FROM supervisa s
INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
WHERE s.id_caso = $1
  AND s.habilitado = true
  AND p.term = (SELECT term FROM semestres ORDER BY fecha_inicio DESC LIMIT 1)
ORDER BY s.term DESC, s.cedula_profesor
LIMIT 1;
