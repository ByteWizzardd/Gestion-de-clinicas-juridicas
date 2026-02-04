-- Obtener todos los soportes creados para un caso específico
-- Parámetro: $1 = id_caso
SELECT 
    a.id,
    a.num_soporte,
    a.id_caso,
    a.nombre_archivo,
    a.tipo_mime,
    a.descripcion,
    a.fecha_consignacion,

    a.fecha_creacion,
    a.id_usuario_subio,
    u.nombres AS nombres_usuario_subio,
    u.apellidos AS apellidos_usuario_subio,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario_subio,
    u.foto_perfil AS foto_perfil_usuario_subio
FROM public.auditoria_insercion_soportes a
LEFT JOIN public.usuarios u ON a.id_usuario_subio = u.cedula
WHERE a.id_caso = $1
ORDER BY a.fecha_creacion DESC;
