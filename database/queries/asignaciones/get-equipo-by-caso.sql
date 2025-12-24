-- Obtener el equipo asignado a un caso (profesores y estudiantes)
-- Solo incluye asignaciones directas: profesores supervisores y estudiantes asignados
-- Parámetros: $1 = id_caso

-- Profesores supervisores
SELECT 
    'profesor' AS tipo,
    s.cedula_profesor AS cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo,
    u.correo_electronico,
    u.telefono_celular,
    s.term,
    s.habilitado,
    'Supervisor' AS rol
FROM supervisa s
INNER JOIN profesores p ON s.term = p.term AND s.cedula_profesor = p.cedula_profesor
INNER JOIN usuarios u ON p.cedula_profesor = u.cedula
WHERE s.id_caso = $1
  AND s.habilitado = true

UNION ALL

-- Estudiantes asignados directamente al caso (tabla se_le_asigna)
SELECT 
    'estudiante' AS tipo,
    sla.cedula_estudiante AS cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo,
    u.correo_electronico,
    u.telefono_celular,
    sla.term,
    sla.habilitado,
    'Asignado' AS rol
FROM se_le_asigna sla
INNER JOIN estudiantes e ON sla.term = e.term AND sla.cedula_estudiante = e.cedula_estudiante
INNER JOIN usuarios u ON sla.cedula_estudiante = u.cedula
WHERE sla.id_caso = $1
  AND sla.habilitado = true

ORDER BY tipo, nombre_completo;