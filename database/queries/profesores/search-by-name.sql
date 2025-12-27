-- Buscar profesores por nombre o apellido (búsqueda parcial)
-- Parámetros: $1 = término de búsqueda (nombre o apellido)
-- Retorna profesores de todos los semestres
SELECT DISTINCT
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
WHERE (u.nombres ILIKE '%' || $1 || '%' 
    OR u.apellidos ILIKE '%' || $1 || '%'
    OR (u.nombres || ' ' || u.apellidos) ILIKE '%' || $1 || '%'
    OR p.cedula_profesor ILIKE '%' || $1 || '%')
  AND u.habilitado_sistema = true
ORDER BY u.apellidos, u.nombres
LIMIT 20;

