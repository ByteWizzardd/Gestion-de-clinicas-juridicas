-- Obtener usuario por nombre_usuario para autenticación
-- Parámetros: $1 = nombre_usuario
-- IMPORTANTE: Ejecutar primero la migración add-nombre-usuario-to-usuarios.sql
SELECT 
    u.cedula,
    u.habilitado,
    u.rol_sistema,
    u.password_hash,
    u.nombre_usuario,
    c.nombres,
    c.apellidos,
    c.correo_electronico
FROM usuarios u
INNER JOIN clientes c ON u.cedula = c.cedula
WHERE u.nombre_usuario = $1;

