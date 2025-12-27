-- Obtener todos los estudiantes activos de todos los semestres
-- Solo incluye estudiantes con usuarios habilitados
-- Retorna el term más reciente de cada estudiante
SELECT DISTINCT ON (e.cedula_estudiante)
    e.cedula_estudiante AS cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo,
    u.correo_electronico,
    u.telefono_celular,
    e.term,
    e.tipo_estudiante,
    e.nrc,
    u.habilitado_sistema
FROM estudiantes e
INNER JOIN usuarios u ON e.cedula_estudiante = u.cedula
INNER JOIN semestres s ON e.term = s.term
WHERE u.habilitado_sistema = true
ORDER BY e.cedula_estudiante, s.fecha_inicio DESC;

