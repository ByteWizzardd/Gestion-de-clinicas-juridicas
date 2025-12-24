-- Obtener todos los cambios de estatus de un caso específico
-- Parámetros: $1 = id_caso
SELECT 
    ce.num_cambio,
    ce.id_caso,
    ce.motivo,
    ce.nuevo_estatus,
    ce.fecha,
    ce.id_usuario_cambia,
    u.nombres AS nombres_usuario,
    u.apellidos AS apellidos_usuario,
    u.nombres || ' ' || u.apellidos AS nombre_completo_usuario
FROM cambio_estatus ce
INNER JOIN usuarios u ON ce.id_usuario_cambia = u.cedula
WHERE ce.id_caso = $1
ORDER BY ce.fecha DESC, ce.num_cambio DESC;

