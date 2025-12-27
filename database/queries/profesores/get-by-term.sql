-- Obtener todos los profesores de un semestre específico
-- Parámetros: $1 = term
SELECT 
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
WHERE p.term = $1
  AND u.habilitado_sistema = true
ORDER BY u.apellidos, u.nombres;

