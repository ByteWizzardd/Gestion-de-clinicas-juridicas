-- Obtener todas las atenciones realizadas para una cita específica
-- Parámetros:
-- $1 = num_cita
-- $2 = id_caso

SELECT 
    a.id_usuario,
    a.num_cita,
    a.id_caso,
    a.fecha_registro,
    u.nombres AS nombres_usuario,
    u.apellidos AS apellidos_usuario,
    CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo_usuario
FROM atienden a
INNER JOIN usuarios u ON a.id_usuario = u.cedula
WHERE a.num_cita = $1 AND a.id_caso = $2
ORDER BY a.fecha_registro DESC;

