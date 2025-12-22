-- Obtener todas las atenciones realizadas para un caso específico
-- Parámetros:
-- $1 = id_caso

SELECT 
    a.id_usuario,
    a.num_cita,
    a.id_caso,
    a.fecha_registro,
    u.nombres AS nombres_usuario,
    u.apellidos AS apellidos_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion
FROM atienden a
INNER JOIN usuarios u ON a.id_usuario = u.cedula
INNER JOIN citas c ON a.num_cita = c.num_cita AND a.id_caso = c.id_caso
WHERE a.id_caso = $1
ORDER BY c.fecha_encuentro DESC, a.fecha_registro DESC;

