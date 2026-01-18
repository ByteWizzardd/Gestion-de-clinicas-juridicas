-- Obtiene las citas donde un usuario específico es parte de los que atienden
-- Mantiene la estructura de columnas de get-all.sql para compatibilidad
-- Parámetros: $1 = cedula_usuario

SELECT 
    c.num_cita,
    c.id_caso,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion,
    -- Información de usuarios que atendieron (array JSON con todos los usuarios)
    -- Se mantiene la subquery completa para mostrar TODOS los que atienden, no solo el usuario filtrado
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id_usuario', a.id_usuario,
                'nombres', u.nombres,
                'apellidos', u.apellidos,
                'nombre_completo', u.nombres || ' ' || u.apellidos,
                'fecha_registro', a.fecha_registro
            )
            ORDER BY a.fecha_registro DESC
        )
        FROM atienden a
        INNER JOIN usuarios u ON a.id_usuario = u.cedula
        WHERE a.num_cita = c.num_cita AND a.id_caso = c.id_caso),
        '[]'::json
    ) AS atenciones,
    -- Información del caso (desde vista)
    vc.tramite,
    vc.estatus,
    vc.cedula,
    vc.nombres_solicitante,
    vc.apellidos_solicitante,
    vc.nombre_completo_solicitante,
    -- Información del núcleo
    vc.id_nucleo,
    vc.nombre_nucleo,
    -- Información del ámbito legal
    vc.id_materia,
    vc.num_categoria,
    vc.num_subcategoria,
    vc.num_ambito_legal,
    vc.nombre_materia,
    vc.nombre_categoria,
    vc.nombre_subcategoria
FROM citas c
INNER JOIN view_casos_detalle vc ON c.id_caso = vc.id_caso
WHERE EXISTS (
    SELECT 1 
    FROM atienden a_filter 
    WHERE a_filter.num_cita = c.num_cita 
      AND a_filter.id_caso = c.id_caso 
      AND a_filter.id_usuario = $1
)
ORDER BY c.fecha_encuentro DESC;
