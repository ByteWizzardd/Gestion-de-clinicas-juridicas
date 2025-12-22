-- Obtener todas las atenciones realizadas por un usuario específico
-- Parámetros:
-- $1 = id_usuario (cedula del usuario)

SELECT 
    a.id_usuario,
    a.num_cita,
    a.id_caso,
    a.fecha_registro,
    c.fecha_encuentro,
    c.fecha_proxima_cita,
    c.orientacion
FROM atienden a
INNER JOIN citas c ON a.num_cita = c.num_cita AND a.id_caso = c.id_caso
WHERE a.id_usuario = $1
ORDER BY a.fecha_registro DESC;

