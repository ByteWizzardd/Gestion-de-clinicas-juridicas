-- Obtener toda la información de un usuario (igual que get-all.sql) pero filtrando por cédula
-- Parámetro: $1 = cédula exacta
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
    -- Información adicional de estudiantes
    CASE 
        WHEN u.tipo_usuario = 'Estudiante' THEN 
            (SELECT string_agg(e.term || ' - ' || e.tipo_estudiante || ' (NRC: ' || e.nrc || ')', ', ' ORDER BY e.term DESC)
             FROM estudiantes e 
             WHERE e.cedula_estudiante = u.cedula)
        ELSE NULL
    END AS info_estudiante,
    -- Información adicional de profesores
    CASE 
        WHEN u.tipo_usuario = 'Profesor' THEN 
            (SELECT string_agg(p.term || ' - ' || p.tipo_profesor, ', ' ORDER BY p.term DESC)
             FROM profesores p 
             WHERE p.cedula_profesor = u.cedula)
        ELSE NULL
    END AS info_profesor,
    -- Información adicional de coordinadores
    CASE 
        WHEN u.tipo_usuario = 'Coordinador' THEN 
            (SELECT string_agg(c.term, ', ' ORDER BY c.term DESC)
             FROM coordinadores c 
             WHERE c.id_coordinador = u.cedula)
        ELSE NULL
    END AS info_coordinador
FROM usuarios u
WHERE u.cedula = $1
LIMIT 1;
