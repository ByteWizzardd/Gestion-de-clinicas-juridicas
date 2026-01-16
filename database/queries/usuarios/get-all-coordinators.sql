-- Selecciona todos los usuarios con el rol de 'Coordinador' activos en el sistema
SELECT
    u.cedula
FROM
    usuarios u
WHERE 
    u.tipo_usuario = 'Coordinador'
    AND u.habilitado_sistema = true;