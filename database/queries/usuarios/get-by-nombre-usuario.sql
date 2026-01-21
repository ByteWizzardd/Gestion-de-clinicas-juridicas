-- Obtener usuario por nombre_usuario para autenticación
-- Parámetros: $1 = nombre_usuario
SELECT 
    u.cedula,
    u.habilitado_sistema AS habilitado,
    u.tipo_usuario AS rol_sistema,
    u.contrasena AS password_hash,
    u.nombre_usuario,
    u.nombres,
    u.apellidos,
    u.correo_electronico
FROM usuarios u
WHERE u.nombre_usuario = $1;

