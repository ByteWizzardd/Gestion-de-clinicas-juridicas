-- Obtener usuario por cédula
-- Parámetros: $1 = cedula
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
WHERE u.cedula = $1;

