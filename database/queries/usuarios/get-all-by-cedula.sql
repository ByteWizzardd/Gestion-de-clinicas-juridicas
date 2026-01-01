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
    -- Estudiante
    e.nrc AS estudiante_nrc,
    e.term AS estudiante_term,
    e.tipo_estudiante AS estudiante_tipo,
    -- Profesor
    p.term AS profesor_term,
    p.tipo_profesor AS profesor_tipo,
    -- Coordinador
    c.term AS coordinador_term
FROM usuarios u
LEFT JOIN estudiantes e ON e.cedula_estudiante = u.cedula
LEFT JOIN profesores p ON p.cedula_profesor = u.cedula
LEFT JOIN coordinadores c ON c.id_coordinador = u.cedula
WHERE u.cedula = $1
LIMIT 1;
