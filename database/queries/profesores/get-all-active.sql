-- Obtener todos los profesores activos de todos los semestres
-- Solo incluye profesores con usuarios habilitados
-- Retorna el term más reciente de cada profesor
SELECT DISTINCT ON (p.cedula_profesor)
    p.cedula_profesor AS cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo,
    u.correo_electronico,
    u.telefono_celular,
    p.term,
    p.tipo_profesor,
    u.habilitado_sistema
FROM profesores p
INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
INNER JOIN semestres s ON p.term = s.term
WHERE u.habilitado_sistema = true
ORDER BY p.cedula_profesor, s.fecha_inicio DESC;

