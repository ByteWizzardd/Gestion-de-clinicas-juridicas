-- Obtener usuario por cédula
-- Parámetros: $1 = cedula
-- IMPORTANTE: Ejecutar primero la migración add-password-to-usuarios.sql
SELECT 
    u.cedula,
    u.habilitado_sistema AS habilitado,
    u.tipo_usuario AS rol_sistema,
    u.contrasena AS password_hash,
    u.nombres,
    u.apellidos,
    u.correo_electronico
FROM usuarios u
WHERE u.cedula = $1;

