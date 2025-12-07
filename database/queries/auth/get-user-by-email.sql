-- Obtener usuario por correo electrónico para autenticación
-- Parámetros: $1 = correo_electronico
-- IMPORTANTE: Ejecutar primero la migración add-password-to-usuarios.sql
SELECT 
    u.cedula,
    u.habilitado,
    u.rol_sistema,
    u.password_hash,
    c.nombres,
    c.apellidos,
    c.correo_electronico
FROM usuarios u
INNER JOIN clientes c ON u.cedula = c.cedula
WHERE c.correo_electronico = $1;

