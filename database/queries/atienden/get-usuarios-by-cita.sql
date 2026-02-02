-- Obtener usuarios que atienden una cita con sus datos
-- Parámetros:
-- $1 = num_cita (INTEGER)
-- $2 = id_caso (INTEGER)
SELECT 
    u.cedula, 
    u.nombres, 
    u.apellidos, 
    CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo
FROM atienden a
INNER JOIN usuarios u ON a.id_usuario = u.cedula
WHERE a.num_cita = $1 AND a.id_caso = $2
ORDER BY u.apellidos, u.nombres;
