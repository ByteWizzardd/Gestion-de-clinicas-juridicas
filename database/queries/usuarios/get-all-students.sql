-- Obtener todos los estudiantes con información detallada
SELECT 
    u.cedula,
    u.nombres,
    u.apellidos,
    u.nombres || ' ' || u.apellidos AS nombre_completo,
    u.correo_electronico,
    u.nombre_usuario,
    u.telefono_celular,
    u.habilitado_sistema,
    u.tipo_usuario,
    -- Información adicional de estudiantes (Solo el tipo del último semestre)
    (SELECT e.tipo_estudiante
     FROM estudiantes e 
     WHERE e.cedula_estudiante = u.cedula
     ORDER BY e.term DESC
     LIMIT 1) AS info_estudiante
FROM usuarios u
WHERE u.tipo_usuario = 'Estudiante'
ORDER BY u.apellidos, u.nombres;
