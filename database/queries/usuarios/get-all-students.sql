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
    -- Información adicional de estudiantes (todos los semestres concatenados)
    (SELECT string_agg(e.term || ' - ' || e.tipo_estudiante || ' (NRC: ' || e.nrc || ')', ', ' ORDER BY e.term DESC)
     FROM estudiantes e 
     WHERE e.cedula_estudiante = u.cedula) AS info_estudiante
FROM usuarios u
WHERE u.tipo_usuario = 'Estudiante'
ORDER BY u.apellidos, u.nombres;
