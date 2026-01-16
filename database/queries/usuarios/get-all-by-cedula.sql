-- Obtener toda la información de un usuario por cédula
-- Incluye todos los semestres en los que está inscrito como estudiante, profesor o coordinador
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
    -- Estudiante (todos los semestres)
    (
        SELECT json_agg(
            json_build_object(
                'term', e.term,
                'nrc', e.nrc,
                'tipo_estudiante', e.tipo_estudiante,
                'habilitado', e.habilitado
            ) ORDER BY e.term DESC
        )
        FROM estudiantes e 
        WHERE e.cedula_estudiante = u.cedula
    ) AS estudiantes,
    -- Profesor (todos los semestres)
    (
        SELECT json_agg(
            json_build_object(
                'term', p.term,
                'tipo_profesor', p.tipo_profesor,
                'habilitado', p.habilitado
            ) ORDER BY p.term DESC
        )
        FROM profesores p 
        WHERE p.cedula_profesor = u.cedula
    ) AS profesores,
    -- Coordinador (todos los semestres)
    (
        SELECT json_agg(
            json_build_object(
                'term', c.term,
                'habilitado', c.habilitado
            ) ORDER BY c.term DESC
        )
        FROM coordinadores c 
        WHERE c.id_coordinador = u.cedula
    ) AS coordinadores
FROM usuarios u
WHERE u.cedula = $1;
