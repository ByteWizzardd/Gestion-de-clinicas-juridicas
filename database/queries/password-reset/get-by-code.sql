-- Obtener token por código de verificación con información del usuario
-- Parámetros:
-- $1 = codigo_verificacion

SELECT 
    prt.id_token,
    prt.cedula_usuario,
    prt.codigo_verificacion,
    prt.fecha_expiracion,
    prt.usado,
    prt.fecha_creacion,
    u.correo_electronico,
    u.nombres,
    u.apellidos
FROM password_reset_tokens prt
INNER JOIN usuarios u ON prt.cedula_usuario = u.cedula
WHERE prt.codigo_verificacion = $1
  AND prt.usado = FALSE
  AND prt.fecha_expiracion >= CURRENT_DATE
ORDER BY prt.fecha_creacion DESC
LIMIT 1;

