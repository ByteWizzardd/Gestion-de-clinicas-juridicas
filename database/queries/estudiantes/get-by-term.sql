-- Obtener todos los estudiantes de un semestre específico
-- Parámetros: $1 = term
SELECT 
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
WHERE e.term = $1
  AND u.habilitado_sistema = true
ORDER BY u.apellidos, u.nombres;

