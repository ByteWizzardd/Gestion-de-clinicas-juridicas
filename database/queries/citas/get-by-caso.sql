-- Obtener todas las citas de un caso específico con información de atenciones
-- Parámetros: $1 = id_caso
SELECT 
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion,
    -- Información de usuarios que atendieron
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id_usuario', a.id_usuario,
                'nombres', u.nombres,
                'apellidos', u.apellidos,
                'nombre_completo', u.nombres || ' ' || u.apellidos,
                'fecha_registro', a.fecha_registro
            )
        )
        FROM atienden a
        INNER JOIN usuarios u ON a.id_usuario = u.cedula
        WHERE a.num_cita = c.num_cita AND a.id_caso = c.id_caso),
        '[]'::json
    ) AS atenciones
FROM citas c
WHERE c.id_caso = $1
ORDER BY c.fecha_encuentro DESC;

